const transporter = require("../config/nodemailer");
const ejs = require("ejs");
const path = require("path");

const sendEmail = async (to, subject, templateName, data) => {
    try {
        const templatePath = path.join(__dirname, "../views/emails", `${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, data);

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Don't throw error to avoid breaking the main flow (e.g. order creation) if email fails
        // But logging is crucial.
    }
};

const sendOrderConfirmationEmail = async (order, user) => {
    try {
        await sendEmail(
            user.email,
            `Order Confirmation #${order.id}`,
            "orderConfirmation",
            {
                order,
                user,
                year: new Date().getFullYear(),
                appName: "TWINCOM"
            }
        );
    } catch (error) {
        console.error("Failed to send order confirmation:", error);
    }
};

const sendVerificationEmail = async (email, otp) => {
    try {
        await sendEmail(
            email,
            "Verify your email",
            "verifyEmail",
            {
                otp,
                email,
                year: new Date().getFullYear(),
                appName: "TWINCOM"
            }
        );
    } catch (error) {
        console.error("Failed to send verification email:", error);
    }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
     try {
        await sendEmail(
            email,
            "Password Reset Request",
            "resetPassword", // Need to create this if used
            {
                resetUrl,
                email,
                year: new Date().getFullYear(),
                appName: "TWINCOM"
            }
        );
    } catch (error) {
        console.error("Failed to send password reset email:", error);
    }
}

const sendWelcomeEmail = async (user) => {
    try {
        await sendEmail(user.email, "Welcome to TWINCOM!", "welcome", { user });
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendEmail 
};
