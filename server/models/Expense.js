const mongoose=require('mongoose');

const expenseSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    amount:{
        type:Number,
        required:true,
        min:0
    },
    category:{
        type:String,
        required:true,
        enum:['food','travel','shopping','bills','entertainment','other'],
        default:'other'
    },
    description:{
        type:String,
        trim:true,
        default:''
    },
    source:{
        type:String,
        enum:['manual','voice']
    },
    date:{
        type:Date,
        default:Date.now
    }},{
        timestamps:true
});

module.exports=new mongoose.model('Expense',expenseSchema);