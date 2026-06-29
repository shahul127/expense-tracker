//importing required modules
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv');
dotenv.config();
//It must be placed after dotenv config as require functions run first and the values will be undefined
const authRoutes=require('./routes/auth');
const expenseRoutes=require('./routes/expense');

const aiRoutes = require('./routes/ai');
//creating a object 
const app=express();

//Allowing the react to send response to other port in the same computer with cors
const allowedOrigins = [
  'http://localhost:5173',                        // local dev
  process.env.FRONTEND_URL,                       // production Vercel URL
].filter(Boolean); // removes undefined if FRONTEND_URL not set yet

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));



//Allowing express to convert our data sent in the form of json
app.use(express.json());
app.use(require('cookie-parser')());
//for otp sending and verification
app.use('/api/auth',authRoutes);
//for CRUD operations manually
app.use('/api/expenses',expenseRoutes);
//creating a get to check 
//for ai

app.use('/api/ai', aiRoutes);
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