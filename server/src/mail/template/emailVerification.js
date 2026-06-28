exports.emailVerificationTemplate = (userName, verificationLink) => {
    return `
    <html></html>
    <body>
        <h1>Email Verification</h1>
        <p>Dear ${userName},</p>
        <p>Thank you for registering with us. Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you did not sign up for this account, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The Team</p>
    </body>
    </html>
    `;
}
exports.passwordResetTemplate = (userName, resetLink) => {
    return `
    <html></html>
    <body><
    /body>
        <h1>Password Reset Request</h1>
        <p>Dear ${userName},</p>
        <p>You have requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The Team</p>
    </body>
    </html>
    `;
}
exports.welcomeEmailTemplate = (userName) => {
    return `
    <html></html>
    <body></body>
        <h1>Welcome to Our Service!</h1>
        <p>Dear ${userName},</p>
     
        <p>We are excited to have you on board. Thank you for joining our community!</p>
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        <br/>
        <p>Best regards,<br/>The Team</p>
    </body>
    </html>
    `;
}

