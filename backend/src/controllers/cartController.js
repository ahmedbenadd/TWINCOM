const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');

const getCartItems = async (cartId) => {
    return await CartItem.findAll({
        where: { cart_id: cartId },
        include: [{
            model: Product,
            as: 'product',
            include: [{ model: ProductImage, as: 'images' }]
        }]
    });
};

const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            cart = await Cart.create({ user_id: userId });
        }

        const cartItems = await getCartItems(cart.id);

        return res.status(200).json({ success: true, cart: { id: cart.id, items: cartItems } });
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ success: false, message: "Missing data" });
        }

        let cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            cart = await Cart.create({ user_id: userId });
        }

        let cartItem = await CartItem.findOne({
            where: { cart_id: cart.id, product_id: productId }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            await CartItem.create({
                cart_id: cart.id,
                product_id: productId,
                quantity
            });
        }

        const cartItems = await getCartItems(cart.id);

        return res.status(200).json({ success: true, cart: { id: cart.id, items: cartItems } });
    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const cartItem = await CartItem.findOne({
            where: { cart_id: cart.id, product_id: productId }
        });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        if (quantity <= 0) {
            await cartItem.destroy();
        } else {
            cartItem.quantity = quantity;
            await cartItem.save();
        }

        const cartItems = await getCartItems(cart.id);

        return res.status(200).json({ success: true, cart: { id: cart.id, items: cartItems } });
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const cartItem = await CartItem.findOne({
            where: { cart_id: cart.id, product_id: productId }
        });

        if(!cartItem) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        await cartItem.destroy();
        
        const cartItems = await getCartItems(cart.id);

        return res.status(200).json({ success: true, cart: { id: cart.id, items: cartItems } });
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ where: { user_id: userId } });
        
        if (cart) {
            await CartItem.destroy({ where: { cart_id: cart.id } });
        }

        return res.status(200).json({ success: true, cart: { id: cart ? cart.id : null, items: [] } });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
