const User = require("../models/User");
const mailsender = require("../utils/mailsender")
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();


exports.resetPasswordToken = async (req, res) => {
    try {

        //verifying the user existness
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User with this email  does not exist"
            });
        }

        //generate token 
        const resettoken = crypto.randomUUID();
        //what it does?? 
        //crypto.randomUUID() is a method in the crypto module
        //  of Node.js that generates a random
        //  universally unique identifier (UUID).
        //  A UUID is a 128-bit number used to
        //  uniquely identify information in computer systems. 
        // The randomUUID() method generates a version 4 UUID, 
        // which is based on random numbers. This means that the
        //  generated UUID is not based on any specific information
        //  and is designed to be unique across all devices and time.
        //  The generated UUID can be used for various purposes,
        //  such as identifying users, sessions, or any other entities
        //  in a system where uniqueness is required.


        //now store the token in database so that when user clicks on that token sending by email or sms could be verify by backend

        const updatedUser = await User.findOneAndUpdate(
            { email: email }, // filter
            {
                resetToken: resettoken,
                resetpasswordExpires: Date.now() + 5 * 60 * 1000 // 5 minutes from now
            }, // update object
            { new: true } // options: return the updated document
        );


        //url for frontend
        const url = `http://localhost:3000/reset-password?token=${resettoken}`;

        //now sending the email after successfully token stored in db 

        await mailsender(email, "Password reset Link ",
            `Password reset link: ${url}`
        );

        //sending successfull response

        return res.status(201).json({
            success: true,
            message: "Email is successfully sent in a secure way"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in sending OTP",
            error: error.message,
        });
    }
}



exports.resetpassword = async (req, res) => {
    try {



        //token will be send by frontend to the req.body
        const { password, confirmpassword, token } = req.body;
        console.log({
            password,
            confirmpassword: confirmpassword,
            token
        });

        if (password !== confirmpassword) {
            return res.status(401).json({
                success: false,
                message: "Passwords are not matched"
            })
        }

        const user = await User.findOne({ resetToken: token })
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Token is Invalid"
            })
        }

        if (user.resetpasswordExpires < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "Token is Expired"
            })
        }


        if (!password || !confirmpassword) {
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            })
        }




        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate(
            { resetToken: token },
            {
                password: hashedPassword,
                resetToken: undefined,
                resetpasswordExpires: undefined
            },
            { new: true }
        );



        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    }


    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "something went wrong while reseting the password"
        })

    }
}
