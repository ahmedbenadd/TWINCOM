const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true // Composite PK part 1
    },
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true // Composite PK part 2
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'OrderItems',
    timestamps: true
});

module.exports = OrderItem;
module.exports = OrderItem;
