let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  // nodemailer is optional for local testing; prevents server crashing
  nodemailer = null;
}

const mailSender = async (email, title, body) => {
  try {
    if (!nodemailer) {
      console.log("nodemailer not installed - skipping email send");
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "NCodeX//BY Neeraj",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);
    return info;
  } catch (error) {
    console.log("getting error while sending to mail", error);
  }
};

module.exports = mailSender;
