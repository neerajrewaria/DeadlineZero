//write the template for this email
exports.courseEnrollmentEmail = (userName, courseName) => {
    return `
    <html></html>
    <body>
        <h1>Welcome to ${courseName}!</h1>
        <p>Dear ${userName},</p>
        <p>Congratulations on enrolling in ${courseName}. We are excited to have you on board!</p>
        <p>Get ready to embark on a journey of learning and growth.</p>
        <p>Best regards,<br/>The Team</p>
    </body>
    </html>
    `;
}
    
    