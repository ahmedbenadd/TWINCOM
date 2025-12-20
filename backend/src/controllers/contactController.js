const path = require("path");
const ejs = require("ejs");
const transporter = require("../config/nodemailer");
const Contact = require("../models/Contact");

const Joi = require('joi');

const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    message: Joi.string().min(10).max(1000).required()
});

const sendContactMessage = async (req, res, next) => {
    try {
        const { error, value } = contactSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { name, email, message } = value;

        await Contact.create({
            name,
            email,
            message,
        });

        // Attempt to send email, but don't fail the request if it fails
        try {
            const templatePath = path.join(__dirname, "../../public/templates/contactEmail.ejs");
            const html = await ejs.renderFile(templatePath, {
                name,
                email,
                message,
                primaryColor: "#0065a1",
                websiteUrl: "http://localhost:3000/",
            });

            const adminMailOptions = {
                from: process.env.SMTP_EMAIL,
                to: process.env.SMTP_EMAIL,
                subject: "New Contact Message",
                html: html,
                attachments: [{
                    filename: 'logo.png',
                    path: path.join(__dirname, '../../public/logos/logo.png'),
                    cid: 'logo'
                }]
            };
            await transporter.sendMail(adminMailOptions);

            const userMailOptions = {
                from: process.env.SMTP_EMAIL,
                to: email,
                subject: "Thank You for Contacting AutoGO",
                html: html,
                attachments: [{
                    filename: 'logo.png',
                    path: path.join(__dirname, '../../public/logos/logo.png'),
                    cid: 'logo'
                }]
            };
            await transporter.sendMail(userMailOptions);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Continue to return success since DB save worked
        }

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully!",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendContactMessage,
};