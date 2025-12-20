const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if system action or deleted user (though usually we keep ID)
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT, // Store JSON string or text description
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    entity_type: {
        type: DataTypes.STRING, // e.g., 'Product', 'Order', 'User'
        allowNull: true
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'ActivityLogs',
    timestamps: true
});

module.exports = ActivityLog;
