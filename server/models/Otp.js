const mongoose=require('mongoose');
const otpSchema=new mongoose.Schema({
    phone:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true//hashed and then stored
    },
    otpExpiry:{
        type:Date,
        required:true,

    },
    cretedAt:{
        type:Date,
        default:Date.now(),
        expires:600
    }
});
module.exports=new mongoose.model('Otp',otpSchema);