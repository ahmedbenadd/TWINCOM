const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Reviews',
    timestamps: true
});

Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

module.exports = Review;
