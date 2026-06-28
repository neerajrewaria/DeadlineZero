const express=require("express")
const router=express.Router();

const {resetPasswordToken,resetpassword}=require('../controllers/resetPassword');

router.post("/reset-password-token", resetPasswordToken);

router.post("/reset-password", resetpassword);

module.exports=router