const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const config = require('../config/config');

function validateSmtpConfig() {
    const { host, port, user, pass, from } = config.smtp || {};
    return !!(host && port && user && pass && from);
}

function createTransport() {
    return nodemailer.createTransport({
        host: config.smtp.host,
        port: Number(config.smtp.port), // 587
        secure: false, // IMPORTANT for port 587
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}

async function verifyTransport(transporter) {
    try {
        await transporter.verify();
        return true;
    } catch (err) {
        console.error('SMTP transporter verification failed:', err);
        return false;
    }
}

async function trySend(transporter, mailOptions) {
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error('Error sending email:', err);
        throw err;
    }
}

exports.sendResetPasswordEmail = async (email, resetToken) => {
    if (!validateSmtpConfig()) {
        console.error('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.');
        throw new Error('SMTP configuration missing');
    }

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

    const originalHost = config.smtp.host;
    let transporter = createTransport();

    // First try: verify transporter
    const ok = await verifyTransport(transporter);
    if (!ok) {
        // If verification failed, and DNS may resolve to IPv6 which is unreachable in some hosts,
        // attempt to resolve an IPv4 address and retry using the IPv4 address while keeping
        // TLS servername set to original hostname so cert validation succeeds.
        try {
            const lookup = await dns.lookup(originalHost, { family: 4 });
            if (lookup && lookup.address) {
                console.log(`Resolved ${originalHost} to IPv4 ${lookup.address}, retrying SMTP over IPv4`);
                transporter = createTransport(lookup.address);
                const ok2 = await verifyTransport(transporter);
                if (!ok2) {
                    console.error('SMTP verification failed after IPv4 fallback');
                }
            } else {
                console.error('No IPv4 address found for SMTP host');
            }
        } catch (dnsErr) {
            console.error('DNS lookup for IPv4 failed:', dnsErr);
        }
    }

    // Attempt send, if it fails with an ENETUNREACH or similar, try IPv4 fallback once more
    try {
        await trySend(transporter, mailOptions);
    } catch (err) {
        const code = err && err.code;
        const message = err && err.message;
        // Network unreachable to IPv6 address (common on some hosts)
        if (code === 'ENETUNREACH' || (message && message.includes('ENETUNREACH')) || message && message.includes('connect ENETUNREACH')) {
            try {
                const lookup = await dns.lookup(originalHost, { family: 4 });
                if (lookup && lookup.address) {
                    console.log(`ENETUNREACH detected, retrying send via IPv4 ${lookup.address}`);
                    transporter = createTransport(lookup.address);
                    await trySend(transporter, mailOptions);
                    return;
                }
            } catch (dnsErr) {
                console.error('IPv4 fallback DNS lookup failed during send:', dnsErr);
            }
        }

        // If we get here, sending failed irrecoverably
        console.error('Final email send failure:', err);
        throw new Error('Email could not be sent');
    }
};
