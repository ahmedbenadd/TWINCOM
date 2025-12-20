const User = require("../models/User");
const Address = require("../models/Address");
const bcrypt = require("bcryptjs");
const Joi = require("joi"); // Import Joi
const { logActivity } = require('../services/activityLogger');

// Validation Schemas
const updateProfileSchema = Joi.object({
    full_name: Joi.string().min(3).max(50).required(),
    email: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9+\s-]{8,20}$/).allow('').optional(),
    role: Joi.forbidden(), // Explictly forbid role manipulation
    is_admin: Joi.forbidden(),
    is_verified: Joi.forbidden()
});

const updatePasswordSchema = Joi.object({
    password: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

const addressSchema = Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().pattern(/^\d{5}$/).required().messages({
        "string.pattern.base": "Zip code must be exactly 5 digits"
    }),
    country: Joi.string().required(),
    is_default: Joi.boolean().optional(),
    addressId: Joi.number().optional() // For update
});

const getUserData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            include: [{ model: Address, as: 'addresses' }]
        });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({
            success: true,
            userData: {
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                addresses: user.addresses,
                is_active: user.is_active,
                is_verified: user.is_verified,
                role: user.role // Return role too
            }
        });
    } catch (error) { next(error); }
};

const { Op } = require('sequelize');

const getAllUsers = async (req, res, next) => {
    try {
        const { search, role, status, sort } = req.query;
        let whereClause = {};

        // HIERARCHY LOGIC & Filters
        const requesterRole = req.user.role;

        // 1. Role Filtering
        // Role Filtering
        // We allow Admins to see other Admins, but Root is always hidden from this list
        if (role) {
            if (role === 'root') { 
                 whereClause.role = { [Op.ne]: 'root' }; 
            } else {
                whereClause.role = role;
            }
        } else {
            // Default: Show all (Users + Admins), exclude Root
            whereClause.role = { [Op.ne]: 'root' };
        }

        // 2. Status Filter
        if (status === 'active') whereClause.is_active = true;
        if (status === 'inactive') whereClause.is_active = false;
        if (status === 'verified') whereClause.is_verified = true;
        if (status === 'unverified') whereClause.is_verified = false;

        // 3. Search Filter (Append to existing whereClause)
        if (search) {
            whereClause[Op.and] = [
                // Clean way to combine existing logic with OR search
                // But since we built 'role' above, careful not to overwrite.
                // Actually, we can use Op.and for the top level.
                // Wait, sequelize handles top level object keys as AND.
                // But if we want (Role AND (Name OR Email)), we need strict structure.
                // The current structure whereClause.role = ... is fine.
                // We just add an [Op.or] property for search.
                {
                    [Op.or]: [
                        { full_name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
            // Admin role constraint is already in whereClause.role, so it's (Role='user' AND (Search Matches))
        }

        // 4. Sorting
        let order = [['createdAt', 'DESC']]; // Default Newest
        if (sort === 'oldest') order = [['createdAt', 'ASC']];
        if (sort === 'name_asc') order = [['full_name', 'ASC']];
        if (sort === 'name_desc') order = [['full_name', 'DESC']];

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'full_name', 'email', 'role', 'is_active', 'is_verified', 'createdAt'],
            order
        });

        return res.status(200).json({ success: true, users });
    } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Validate input
        const { error } = updateProfileSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { full_name, email, phone } = req.body;
        
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // SECURITY: Admins/Root cannot change their own identifying info (Audit Trail)
        if ((user.role === 'admin' || user.role === 'root') && (email !== user.email || full_name !== user.full_name)) {
             return res.status(403).json({ success: false, message: "Administrators cannot change their own Name or Email. Contact Root." });
        }
        
        // Track changes for logging
        const changes = [];
        if (user.email !== email) changes.push(`Email changed from ${user.email} to ${email}`);
        if (user.full_name !== full_name) changes.push('Name updated');
        
        if (user.email !== email) { user.email = email; user.is_verified = false; }
        user.full_name = full_name;
        user.phone = phone !== undefined ? phone : user.phone;
        await user.save();
        
        await logActivity(user.id, 'UPDATE_PROFILE', 'User', user.id, `Profile updated: ${changes.join(', ')}`, req);

        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) { next(error); }
};

const updatePassword = async (req, res, next) => {
     try {
        const userId = req.user.id;
        
        // Validate input
        const { error } = updatePasswordSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { password, newPassword } = req.body;
        
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid Password" });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await logActivity(user.id, 'CHANGE_PASSWORD', 'User', user.id, 'User changed their password', req);

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) { next(error); }
};

const addAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Validate input
        const { error } = addressSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { street, city, state, zip_code, country, is_default } = req.body;
        
        if (is_default) await Address.update({ is_default: false }, { where: { user_id: userId } });
        const address = await Address.create({ user_id: userId, street, city, state, zip_code, country, is_default: is_default || false });
        return res.status(200).json({ success: true, message: "Address added", address });
    } catch (error) { next(error); }
};

const updateAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Validate input - allow partial but if fields are present they must be valid. 
        // Using same schema but making fields optional or just validating the payload. 
        // For strictness, let's validate the whole body if we expect full update, or assume checks. 
        // Since the frontend sends the whole object mostly, validation helps.
        // Or create a flexible schema. Let's use the same schema but allow unknowns if id is there?
        // Actually, updateAddress receives specific fields. Let's validate checked fields.
        const { error } = addressSchema.validate(req.body, { allowUnknown: true }); 
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { addressId, street, city, state, zip_code, country, is_default } = req.body;
        const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
        if (!address) return res.status(404).json({ success: false, message: "Address not found" });
        if (is_default) await Address.update({ is_default: false }, { where: { user_id: userId } });
        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zip_code = zip_code || address.zip_code;
        address.country = country || address.country;
        address.is_default = is_default !== undefined ? is_default : address.is_default;
        await address.save();
        return res.status(200).json({ success: true, message: "Address updated", address });
    } catch (error) { next(error); }
};

const deleteAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.body;
        
        if (!addressId) return res.status(400).json({ success: false, message: "Address ID is required" });

        const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
        if (!address) return res.status(404).json({ success: false, message: "Address not found" });
        await address.destroy();
        return res.status(200).json({ success: true, message: "Address deleted" });
    } catch (error) { next(error); }
};

const setDefaultAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.body;
        
        if (!addressId) return res.status(400).json({ success: false, message: "Address ID is required" });
        
        const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
        if (!address) return res.status(404).json({ success: false, message: "Address not found" });

        // Unset previous default
        await Address.update({ is_default: false }, { where: { user_id: userId } });

        // Set new default
        address.is_default = true;
        await address.save();

        return res.status(200).json({ success: true, message: "Default address updated" });
    } catch (error) { next(error); }
};

const createUserByAdmin = async (req, res, next) => {
    try {
        const { full_name, email, password, role, is_active, is_verified } = req.body;
        
        // HIERARCHY CHECK
        const requester = req.user;
        if (role && role === 'admin' && requester.role !== 'root') {
             return res.status(403).json({ success: false, message: "Only Root can create Admins." });
        }
        if (role && role === 'root') {
             return res.status(403).json({ success: false, message: "Cannot create Root user." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            full_name,
            email,
            password: hashedPassword,
            role: role || 'user',
            is_active: is_active !== undefined ? is_active : true,
            is_verified: is_verified !== undefined ? is_verified : true // Admin created users are verified by default
        });

        await logActivity(req.user.id, 'CREATE_USER_ADMIN', 'User', newUser.id, `Created user ${newUser.email} (Role: ${newUser.role})`, req);

        return res.status(201).json({ success: true, message: "User created successfully", user: newUser });
    } catch (error) { next(error); }
};

const updateUserByAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { full_name, email, role, is_active, is_verified, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const requester = await User.findByPk(req.user.id);

        // HIERARCHY CHECK:
        // If requester is 'admin', they cannot edit another 'admin' or 'root'
        if (requester.role === 'admin' && (user.role === 'admin' || user.role === 'root')) {
             return res.status(403).json({ success: false, message: "Admins cannot modify other Admins." });
        }

        if (full_name) user.full_name = full_name;
        if (email) user.email = email;
        if (is_active !== undefined) user.is_active = is_active;
        if (is_verified !== undefined) user.is_verified = is_verified;
        
        // Handle Role Update
        if (role) {
             // ROOT ADMIN SECURITY: Only the specific root admin can change roles
             const requester = await User.findByPk(req.user.id);
             
             // Check if requester is ROOT
             if (requester.role !== 'root') {
                 return res.status(403).json({ success: false, message: "Only the Root Administrator can change user roles." });
             }

             // ROOT SECURITY: Prevent modifying the Root User's role (Immutable)
             if (user.role === 'root') {
                 return res.status(403).json({ success: false, message: "Root administrator role cannot be changed." });
             }

             // ROOT SECURITY: Prevent assigning 'root' role (Root is ONE and ONLY ONE)
             if (role === 'root') {
                 return res.status(403).json({ success: false, message: "Cannot assign Root role. There is only one Root user." });
             }

             // Only Root can assign/revoke Admin roles
             user.role = role;
        }

        // Handle Password Update (Admin Reset)
        if (password && password.trim() !== '') {
             if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
             const hashedPassword = await bcrypt.hash(password, 10);
             user.password = hashedPassword;
             await logActivity(req.user.id, 'RESET_PASSWORD_ADMIN', 'User', user.id, `Reset password for ${user.email}`, req);
        }

        await user.save();

        await logActivity(req.user.id, 'UPDATE_USER_ADMIN', 'User', user.id, `Updated user ${user.email} (Role: ${user.role})`, req);

        return res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error) { next(error); }
};


const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // ROOT SECURITY: Prevent deleting the Root User
        if (user.role === 'root') {
            return res.status(403).json({ success: false, message: "Root user cannot be deleted." });
        }

        // HIERARCHY CHECK:
        const requester = await User.findByPk(req.user.id);
        
        // If requester is 'admin', they cannot delete another 'admin'
        if (requester.role === 'admin' && user.role === 'admin') {
             return res.status(403).json({ success: false, message: "Admins cannot delete other Admins." });
        }

        await user.destroy();
        
        await logActivity(req.user.id, 'DELETE_USER', 'User', user.id, `Deleted user ${user.email} (Role: ${user.role})`, req);

        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) { next(error); }
};

module.exports = {
    getUserData,
    getAllUsers,
    updateUser,
    updatePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateUserByAdmin,
    createUserByAdmin,
    deleteUser
};


