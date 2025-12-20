const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getActivityLogs = async (req, res, next) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { search, action, start_date, end_date, sort, entity_type } = req.query;

        let whereClause = {};

        // Filter by Action Type
        if (action) {
            whereClause.action = action;
        }

        // Filter by Entity Type
        if (entity_type) {
            whereClause.entity_type = entity_type;
        }

        // Search in Details or User Name (requires association logic or plain details check)
        // Advanced Case-Insensitive Search
        // Search in Details, Action, IP, Entity Type, or User Name/Email
        if (search) {
            const searchLower = search.toLowerCase();
            whereClause[Op.or] = [
                // Activity Log Fields
                sequelize.where(sequelize.fn('lower', sequelize.col('details')), 'LIKE', `%${searchLower}%`),
                sequelize.where(sequelize.fn('lower', sequelize.col('ip_address')), 'LIKE', `%${searchLower}%`),
                sequelize.where(sequelize.fn('lower', sequelize.col('ActivityLog.action')), 'LIKE', `%${searchLower}%`), // Specify table to be safe
                sequelize.where(sequelize.fn('lower', sequelize.col('entity_type')), 'LIKE', `%${searchLower}%`),
                
                // Associated User Fields (using $AssociationAlias.field$ syntax)
                sequelize.where(sequelize.fn('lower', sequelize.col('user.full_name')), 'LIKE', `%${searchLower}%`),
                sequelize.where(sequelize.fn('lower', sequelize.col('user.email')), 'LIKE', `%${searchLower}%`)
            ];
        }

        // Date Range Filter
        if (start_date || end_date) {
            whereClause.createdAt = {};
            if (start_date) {
                const sDate = new Date(start_date);
                if (!isNaN(sDate.getTime())) whereClause.createdAt[Op.gte] = sDate;
            }
            if (end_date) {
                const eDate = new Date(end_date);
                if (!isNaN(eDate.getTime())) whereClause.createdAt[Op.lte] = new Date(eDate.setHours(23, 59, 59, 999));
            }
        }

        // Sorting
        let order = [['createdAt', 'DESC']]; // Default
        if (sort === 'oldest') order = [['createdAt', 'ASC']];

        const { count, rows } = await ActivityLog.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'role'] }
            ],
            order,
            limit,
            offset
        });

        return res.status(200).json({
            success: true,
            logs: rows,
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

module.exports = { getActivityLogs };
