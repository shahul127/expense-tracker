const jwt=require('jsonwebtoken');
//verifying wehther the token is correct 
const verifyToken=(req,res,next)=>{
    
        //the token will be in the request header authorization part
      const authHeader=req.headers.authorization;
      if(!authHeader||!authHeader.startsWith('Bearer ')){
        return res.status(401).json({message:'No token available '});}
    const token=authHeader.split(' ')[1];
    try{
        let decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.userId=decoded.userId;//attaching the user id so that after this middle ware the next route or middleware does not need to check and verify again

        next();//calling the next function 
    }catch(err){
        console.log('there is no accestoken present or the accestoken is not valid');
        return res.status(401).json({message:'Invalid or expired token'});
    }

    
};
module.exports=verifyToken;