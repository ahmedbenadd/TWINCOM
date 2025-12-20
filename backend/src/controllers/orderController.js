const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const User = require('../models/User');

const sequelize = require('../config/database');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const { logActivity } = require('../services/activityLogger');

// ... (keep imports)

const createOrder = async (req, res, next) => {
    let t;
    try {
        const userId = req.user.id;
        
        // Security Check: Ensure user is verified before allowing order
        if (!req.user.is_verified) {
             return res.status(403).json({ success: false, message: "Please verify your email to place an order." });
        }

        const { shippingAddress, city, zipCode } = req.body;

        // Strict Validation for Postal Code
        const postalCodeToCheck = typeof shippingAddress === 'object' && shippingAddress.postalCode ? shippingAddress.postalCode : zipCode;
        if (!postalCodeToCheck || !/^\d{5}$/.test(postalCodeToCheck.toString())) {
             return res.status(400).json({ success: false, message: "Postal Code must be exactly 5 digits." });
        }

        // START TRANSACTION
        t = await sequelize.transaction();

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cart = await Cart.findOne({ where: { user_id: userId }, transaction: t });
        if (!cart) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const cartItems = await CartItem.findAll({
            where: { cart_id: cart.id },
            transaction: t
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Fetch Products with LOCK.UPDATE to prevent race conditions
        const productIds = cartItems.map(item => item.product_id);
        const products = await Product.findAll({
            where: { id: productIds },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        // Map for easy access
        const productMap = new Map(products.map(p => [p.id, p]));

        let calculatedTotal = 0;
        const orderItemsForEmail = []; 

        for (const item of cartItems) {
            const product = productMap.get(item.product_id);
            
            if (!product) {
                await t.rollback();
                return res.status(400).json({ success: false, message: `Product ${item.product_id} not found` });
            }

            // Re-check stock with locked data
            if (product.quantity < item.quantity) {
                await t.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
                });
            }
            calculatedTotal += parseFloat(product.price) * item.quantity;
            item.product = product; // Attach for later use
        }

        const order = await Order.create({
            user_id: userId,
            full_name: user.full_name || 'Guest',
            email: user.email,
            address: typeof shippingAddress === 'string' ? shippingAddress : (shippingAddress?.address || 'N/A'),
            city: typeof shippingAddress === 'object' && shippingAddress.city ? shippingAddress.city : city,
            postal_code: typeof shippingAddress === 'object' && shippingAddress.postalCode ? shippingAddress.postalCode : zipCode,
            country: typeof shippingAddress === 'object' && shippingAddress.country ? shippingAddress.country : 'N/A',
            total_price: calculatedTotal,
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'Cash on Delivery' 
        }, { transaction: t });

        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.product.price
            }, { transaction: t });

            // Reduce Stock Atomically
            await item.product.decrement('quantity', { by: item.quantity, transaction: t });

            orderItemsForEmail.push({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            });
        }

        // Clear Cart
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

        // COMMIT
        await t.commit();

        // Send Email (outside transaction)
        const orderForEmail = order.toJSON();
        orderForEmail.items = orderItemsForEmail;
        // Send Confirmation Email
        // We use fresh order data (though 'order' variable has ID)
        sendOrderConfirmationEmail(order, user, orderItemsForEmail).catch(err => console.error("Email failed", err));

        await logActivity(req.user.id, 'CREATE_ORDER', 'Order', order.id, `Order created. Total: ${calculatedTotal}`, req);

        return res.status(201).json({ success: true, message: "Order created successfully", orderId: order.id });

    } catch (error) { 
        if (t) await t.rollback();
        next(error); 
    }
};

const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [{
                model: OrderItem, as: 'items',
                include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images' }] }]
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ success: true, orders });
    } catch (error) { next(error); }
};

const { Op } = require('sequelize');

const getAllOrders = async (req, res, next) => {
    try {
        const { search, status, payment_status, sort, minTotal, maxTotal, start_date, end_date } = req.query;

        let whereClause = {};
        let userWhereClause = {};

        // 1. Status Filter
        if (status) whereClause.status = status;
        if (payment_status) whereClause.payment_status = payment_status;

        // 2. Price Range Filter
        if (minTotal || maxTotal) {
            whereClause.total_price = {};
            if (minTotal) whereClause.total_price[Op.gte] = minTotal;
            if (maxTotal) whereClause.total_price[Op.lte] = maxTotal;
        }

        // 3. Date Range Filter
        if (start_date || end_date) {
            whereClause.createdAt = whereClause.createdAt || {};
            if (start_date) whereClause.createdAt[Op.gte] = new Date(start_date);
            if (end_date) whereClause.createdAt[Op.lte] = new Date(new Date(end_date).setHours(23, 59, 59, 999));
        }

        // 3. Search logic (unchanged essentially, just merged)
        if (search) {
            if (!isNaN(search)) {
                whereClause.id = search;
            } else {
                userWhereClause = {
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } },
                        { full_name: { [Op.like]: `%${search}%` } }
                    ]
                };
            }
        }

        // 4. Sorting
        let order = [['createdAt', 'DESC']]; // Default
        if (sort === 'oldest') order = [['createdAt', 'ASC']];
        if (sort === 'price_asc') order = [['total_price', 'ASC']];
        if (sort === 'price_desc') order = [['total_price', 'DESC']];

        const orders = await Order.findAll({
            where: whereClause,
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'email', 'full_name'],
                    where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
                    required: Object.keys(userWhereClause).length > 0
                },
                {
                    model: OrderItem, as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order
        });
        return res.status(200).json({ success: true, orders });
    } catch (error) { next(error); }
};

const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const previousStatus = order.status;
        const previousPayment = order.payment_status;

        if (status) order.status = status;
        if (payment_status) order.payment_status = payment_status;

        await order.save();

        // LOGGING
        if (status && status !== previousStatus) {
            await logActivity(req.user.id, 'UPDATE_ORDER_STATUS', 'Order', order.id, `Status changed from ${previousStatus} to ${status}`, req);
        }
        if (payment_status && payment_status !== previousPayment) {
             await logActivity(req.user.id, 'UPDATE_ORDER_PAYMENT', 'Order', order.id, `Payment status changed from ${previousPayment} to ${payment_status}`, req);
        }

        return res.status(200).json({ success: true, message: "Order updated successfully", order });
    } catch (error) { next(error); }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrder
};
