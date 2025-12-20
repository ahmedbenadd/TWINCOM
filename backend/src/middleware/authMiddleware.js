const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {

        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id);

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'root')) {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Not authorized as an admin" });
    }
};

module.exports = { protect, admin };
