const express=require('express');
const router=express.Router();
const {sendOtp,verifyOtp,refreshAccessToken,logOut}=require('../controller/authController');


router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
router.post('/refresh',refreshAccessToken);
router.post('/logout',logOut);



module.exports=router;