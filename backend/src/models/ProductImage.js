const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// Product reference removed to avoid circular dependency

const ProductImage = sequelize.define('ProductImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    alt_text: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'ProductImages',
    timestamps: true
});

// We can safely access proper models from sequelize object after definition
// Wait for next tick or just define it here if possible? 
// Safer: relying on lazy loading by not requiring the module but using the string name or sequelize.models
// But since this file is mistakenly being 'required' by Product.js, Product is already in sequelize.models.

ProductImage.belongsTo(sequelize.models.Product, { foreignKey: 'product_id', as: 'product' });

module.exports = ProductImage;
