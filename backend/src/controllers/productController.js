const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImage = require('../models/ProductImage');
const { Op } = require('sequelize');
const { logActivity } = require('../services/activityLogger');
const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    long_description: Joi.string().allow('').optional(),
    price: Joi.number().positive().precision(2).required(),
    category_id: Joi.number().integer().required(),
    brand: Joi.string().allow('').optional(),
    quantity: Joi.number().integer().min(0).default(0),
    is_hidden: Joi.boolean().optional(),
    images: Joi.array().items(Joi.object({
        url: Joi.string().uri().required(),
        alt_text: Joi.string().allow('').optional()
    })).optional(),
    specs: Joi.object().optional()
});

const checkAdmin = (user) => {
    return user && (user.role === 'admin' || user.role === 'root');
};

const createProduct = async (req, res, next) => {
    try {
        if (!checkAdmin(req.user)) return res.status(403).json({ success: false, message: "Access denied" });

        const { error, value } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { name, description, long_description, price, category_id, brand, quantity, images, is_hidden, specs } = value;
        
        const product = await Product.create({
            name,
            description,
            long_description: long_description || description,
            price,
            category_id,
            brand,
            quantity: quantity || 0,
            is_hidden: is_hidden !== undefined ? is_hidden : false,
            specs: specs || {}
        });

        if (images && Array.isArray(images)) {
            const imagePromises = images.map(img => ProductImage.create({
                product_id: product.id,
                url: img.url,
                alt_text: img.alt_text || name
            }));
            await Promise.all(imagePromises);
        }

        const createdProduct = await Product.findByPk(product.id, {
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
            ]
        });

        await logActivity(req.user.id, 'CREATE_PRODUCT', 'Product', product.id, `Created product: ${product.name}`, req);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: createdProduct
        });
    } catch (error) {
        next(error);
    }
};

const getAllProducts = async (req, res, next) => {
    try {
        const { search, category, minPrice, maxPrice, sort, brand, includeHidden, visibility } = req.query;

        let whereClause = {};

        // Visibility Filter
        if (visibility === 'hidden') {
            whereClause.is_hidden = true;
        } else if (visibility === 'all' || includeHidden === 'true') {
            // Show all (no is_hidden constraint)
        } else {
            // Default: Show only visible
            whereClause.is_hidden = false;
        }

        // Search (Name or Description)
        if (search) {
            whereClause[Op.and] = [
                ...(whereClause.is_hidden !== undefined ? [{ is_hidden: whereClause.is_hidden }] : []),
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { long_description: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
            delete whereClause.is_hidden; 
        }

        // Category Filter
        if (category) {
             whereClause.category_id = category;
        }

        // Brand Filter
        if (brand) {
            whereClause.brand = brand;
        }

        // Low Stock Filter
        if (req.query.lowStock === 'true') {
            whereClause.quantity = { [Op.lt]: 10 };
        }

        // Price Filter
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = minPrice;
            if (maxPrice) whereClause.price[Op.lte] = maxPrice;
        }

        // Sorting
        let order = [];
        if (sort === 'price_asc') {
            order.push(['price', 'ASC']);
        } else if (sort === 'price_desc') {
            order.push(['price', 'DESC']);
        } else if (sort === 'newest') {
            order.push(['createdAt', 'DESC']);
        } else {
            order.push(['createdAt', 'DESC']);
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8; 
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
            ],
            order,
            limit,
            offset,
            distinct: true
        });

        return res.status(200).json({
            success: true,
            products: rows,
            pagination: {
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
            ]
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        if (!checkAdmin(req.user)) return res.status(403).json({ success: false, message: "Access denied" });

        const { id } = req.params;
        const { name, description, long_description, price, category_id, brand, quantity, images, is_hidden, specs } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.long_description = long_description || product.long_description;
        product.price = price || product.price;
        product.category_id = category_id || product.category_id;
        product.brand = brand || product.brand;
        product.quantity = quantity !== undefined ? quantity : product.quantity;
        if (is_hidden !== undefined) product.is_hidden = is_hidden;
        if (specs !== undefined) product.specs = specs;

        await product.save();

        if (images && Array.isArray(images)) {
            await ProductImage.destroy({ where: { product_id: id } });
            
            const imagePromises = images.map(img => ProductImage.create({
                product_id: id,
                url: img.url,
                alt_text: img.alt_text || name
            }));
            await Promise.all(imagePromises);
        }

        await logActivity(req.user.id, 'UPDATE_PRODUCT', 'Product', product.id, `Updated product: ${product.name}`, req);

        const updatedProduct = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        if (!checkAdmin(req.user)) return res.status(403).json({ success: false, message: "Access denied" });

        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await product.destroy();
        await logActivity(req.user.id, 'DELETE_PRODUCT', 'Product', id, `Deleted product: ${product.name}`, req);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const toggleProductVisibility = async (req, res, next) => {
    try {
        if (!checkAdmin(req.user)) return res.status(403).json({ success: false, message: "Access denied" });

        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.is_hidden = !product.is_hidden;
        await product.save();

        await logActivity(req.user.id, 'TOGGLE_VISIBILITY', 'Product', id, `Set visibility to ${!product.is_hidden}`, req);

        return res.status(200).json({
            success: true,
            message: `Product is now ${product.is_hidden ? 'Hidden' : 'Visible'}`,
            product
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleProductVisibility
};
