const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mailSender = require('../utils/mailsender');
const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // document auto-deletes after 300 seconds (5 minutes)
    },
  }
);


async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(email, "Verfication email from NCodeX ||..by Neeraj", otp);
    console.log("response from mail sender", mailResponse);
  } catch (error) {
    console.log("An error occured while sending email", error);

  }

}

otpSchema.pre("save", async function () {
  await sendVerificationEmail(this.email, this.otp);
})


module.exports = mongoose.model('OTP', otpSchema);