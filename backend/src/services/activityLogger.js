const ActivityLog = require('../models/ActivityLog');

/**
 * Logs a user activity.
 * @param {string|number|null} userId - ID of the user performing the action (null for system)
 * @param {string} action - Short description of action (e.g., 'LOGIN', 'CREATE_PRODUCT')
 * @param {string} entityType - The entity involved (e.g., 'Product', 'Order')
 * @param {number|null} entityId - ID of the entity
 * @param {object|string} details - Additional info (will be stringified)
 * @param {object} req - Express request object (to extract IP)
 */
const logActivity = async (userId, action, entityType, entityId, details, req) => {
    try {
        let ipAddress = 'unknown';
        if (req) {
            ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        }

        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);

        await ActivityLog.create({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details: detailsStr,
            ip_address: ipAddress
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Do not throw, logging should not break the main flow
    }
};

module.exports = { logActivity };
