const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port == 465, // true for 465, false for other ports
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

exports.sendResetPasswordEmail = async (email, resetToken) => {
    const baseUrl = config.frontendUrl.endsWith('/') ? config.frontendUrl.slice(0, -1) : config.frontendUrl;
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    const mailOptions = {
        from: config.smtp.from,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h1>You requested a password reset</h1>
            <p>Please click on the following link to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};
