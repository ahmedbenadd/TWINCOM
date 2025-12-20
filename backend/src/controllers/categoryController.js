const Category = require('../models/Category');

const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, description, image } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

        const category = await Category.create({ name, description, image });
        return res.status(201).json({ success: true, message: "Category created", category });
    } catch (error) { next(error); }
};

const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, image } = req.body;
        
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        if (name) category.name = name;
        if (description) category.description = description;
        if (image) category.image = image;

        await category.save();
        return res.status(200).json({ success: true, message: "Category updated", category });
    } catch (error) { next(error); }
};

const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        await category.destroy();
        return res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) { next(error); }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
