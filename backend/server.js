const express = require('express');
const dotenv = require('dotenv').config(); // Load env vars
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./src/config/database');
const errorHandler = require('./src/middleware/errorMiddleware');

// Connect to database
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        // Initialize associations
        require('./src/models'); 
    })
    .catch(err => console.log('Error: ' + err));

// Sync database
sequelize.sync()
    .then(() => console.log('Database synced...'))
    .catch(err => console.log('Error syncing database: ' + err));

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static('public'));

// Routes
app.use('/api/activity-logs', require('./src/routes/activityRoutes'));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/contact', require('./src/routes/contactRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
// app.use('/api/activity-logs', ... moved up);

// Security Middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Use Helmet for secure headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Auth Rate Limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // Limit each IP to 15 login/signup requests per hour
    message: 'Too many login attempts, please try again after an hour'
});
app.use('/api/auth', authLimiter);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
