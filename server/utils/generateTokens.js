const jwt=require('jsonwebtoken');
const { useId } = require('react');
//generating access token
const generateAccessToken=(userId)=>{
    return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'15m'});
};
const generateRefreshToken=(userId)=>{
    return jwt.sign({userId},process.env.JWT_REFRESH_SEC,{expiresIn:'7d'});
};
const setRefreshToken=(res,refreshToken)=>{
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
            maxAge:7*24*60*60*1000
        });

};
module.exports={generateAccessToken,generateRefreshToken,setRefreshToken};