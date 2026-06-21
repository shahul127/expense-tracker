const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    
        phone:{
            type:String,
            unique:true,
            required:true,
            trim:true
        },
        name:{
            type:String,
            trim:true
        },
        isVerified:{
            type:Boolean,
            default:false
        }
    },{
        timestamps:true
    }
);

module.exports=new mongoose.model('User',userSchema);