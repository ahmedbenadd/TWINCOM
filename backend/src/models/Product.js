const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    long_description: {
        type: DataTypes.TEXT, // Changed to TEXT to hold larger content
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    is_hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    specs: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        get() {
            const rawValue = this.getDataValue('specs');
            // If it's a string, try to parse it
            if (typeof rawValue === 'string') {
                try {
                    return JSON.parse(rawValue);
                } catch (e) {
                    return {};
                }
            }
            // If it's already an object (or null), return it
            return rawValue || {};
        }
    }
}, {
    tableName: 'Products',
    timestamps: true
});

Product.belongsTo(require('./Category'), { foreignKey: 'category_id', as: 'category' });
Product.hasMany(require('./ProductImage'), { foreignKey: 'product_id', as: 'images' });

module.exports = Product;
