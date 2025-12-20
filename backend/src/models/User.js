const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
        // format validation moved to model-wide validator
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'root'),
        defaultValue: 'user'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verification_otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verification_otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reset_password_otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_password_otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Users',
    timestamps: true
});

module.exports = User;
