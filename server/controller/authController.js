//this is the place where we get the req and send the response 
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/User');
const Otp=require('../models/Otp');
//sending sms via twilio
const sendSms=require('../utils/sendSms');
const {generateAccessToken,generateRefreshToken,setRefreshToken, refreshToken}=require('../utils/generateTokens');

//send otp function
const sendOtp=async (req,res)=>{
    try{
        const {phone}=req.body;
        if(!phone){
            return res.status(400).json({message:'phone number is required'});

        }
        const phoneRegex=/^[6-9]\d{9}$/
        if(!phoneRegex.test(phone)){
            return res.status(400).json({message:'Enter the valid Indian phone number'});
        }
        const otp=Math.floor(100000+Math.random()*900000).toString();
        const otpHashed=await bcrypt.hash(otp,10);
        await Otp.deleteMany({phone});
        //creating a document in db
        await Otp.create({
            phone,
            otp:otpHashed,
            otpExpiry:new Date(Date.now()+5*60*1000)//5 minutes as expiry time (milliseconds)

        });
        sendSms(phone,otp);
        return res.status(200).json({message:'Otp sent succesfully to your mobile number'});
    }catch(error){
        console.log(error);
        console.log('Server error otp is not sent');
        console.log(error);
        return res.status(500).json({message:'Server error Please try again'});
    }

};
const verifyOtp=async(req,res)=>{
   try{
    const { phone,otp }=req.body;
    //check if it is present
    if(!phone||!otp){
        return res.status(400).json({message:'Phone and otp is required'});
    }
    const otpRecord=await Otp.findOne({phone});
    if(!otpRecord){
        return res.status(400).json({message:'otp is not send please try again'});
    }
    if(Date.now()>otpRecord.otpExpiry){
        return res.status(400).json({message:'Otp is expired so send it again'});
    }
    const isVerified=await bcrypt.compare(otp,otpRecord.otp);
    if(!isVerified){
        return res.status(400).json({message:'Entered otp is wrong so try again'});
    }
    await Otp.deleteOne({phone});
    let user=await User.findOne({phone});
    if(!user){
        user = await User.create({ phone, isVerified: true });
    }else{
        user.isVerified=true;
        await user.save();

    }
    const accessToken=generateAccessToken(user._id);
    const refreshToken=generateRefreshToken(user._id);
    setRefreshToken(res,refreshToken);
    res.status(200).json({
        message:'Otp is successfully verified',
        accessToken,
        user:{
            id:user._id,
            phone:user.phone,
            name:user.name
        }
    });
    
     
   }catch(error){
    console.log('Otp verification error in server');
    console.log(error);
    return res.status(500).json({message:'server error otp verification failed'});
   }


};
//for refreshing the accesstoken
const refreshAccessToken=async(req,res)=>{
  try{
    const {refreshToken}=req.cookies;
    if(!refreshToken){
        return res.status(401).json({message:'No refreshToken is found so please login'});

    }
    //now the refreshtoken is found so verify 
    let decoded;
    try{
      decoded=jwt.verify(refreshToken,process.env.JWT_REFRESH_SEC);
    }catch(err){
        return res.status(403).json({message:'the refreshtoken is wrong so login again'});
    }
    //now find if the user is still valid
    const user=await User.findById(decoded.userId);
    if(!user){
        return res.status(404).json({message:'user is not found'});
    }
    const newAccessToken=generateAccessToken(user._id);
    return res.status(200).json({accessToken:newAccessToken});
  }catch(err){
    console.log('refreshaccesstoken error in backend');
    return res.status(500).json({message:'server errror in the refreshAccesstoken '});
  }
};

//logout section
const logOut=(req,res)=>{
    res.clearCookie('refreshToken',{
         httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
    }
    );
    res.status(200).json({message:'Logged out successfully'});
};
module.exports={sendOtp,verifyOtp,refreshAccessToken,logOut};
