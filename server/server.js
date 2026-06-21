//importing required modules
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');

const dotenv=require('dotenv');
dotenv.config();
//It must be placed after dotenv config as require functions run first and the values will be undefined
const authRoutes=require('./routes/auth');
const expenseRoutes=require('./routes/expense');
//creating a object 
const app=express();

//Allowing the react to send response to other port in the same computer with cors
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));

//Allowing express to convert our data sent in the form of json
app.use(express.json());
app.use(require('cookie-parser')());
//for otp sending and verification
app.use('/api/auth',authRoutes);
//for CRUD operations manually
app.use('/api/expense',expenseRoutes);
//creating a get to check 
app.get('/api/project',(req,res)=>{
    res.json({
        status:'ok',
        message:'Respond is received',
        time:new Date
    })
});

const port=process.env.PORT;
//Connecting to mongodb
mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log(`MONGODB CONNECTED`);
    app.listen(port,()=>{
        console.log(`connected to port ${port}`);
    });
}).catch(
    (err)=>{
     console.error(err.message);
     process.exit(1);
    }
);