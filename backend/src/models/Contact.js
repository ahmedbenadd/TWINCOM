const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'Contacts',
    timestamps: true
});

module.exports = Contact;