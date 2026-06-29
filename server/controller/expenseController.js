const Expense=require('../models/Expense');

const createExpense=async(req,res)=>{
 try{
    const {amount,category,description,date,source}=req.body;
    if(!amount){
        return res.status(400).json({message:'Amount is required to add an expense'});
    }
    if(amount<=0){
        return res.status(400).json({message:'amount must be greater that 0'});
    }
     //crating the expense
    const expense=await Expense.create({
        userId:req.userId,
        amount,
        category,
        description,
        source:source||'manual',
        date
    });
    return res.status(201).json({message:'expense is created successfully',expense});
 }catch(error){
    console.error('Create expense error',error);
    return res.status(500).json({message:'server error in create expense Please try again'});
 }
};
//to get all expenses to that particular user
const getExpense=async(req,res)=>{
    try{
        const {category,startDate,endDate}=req.query;
        const filter={userId:req.userId};
        if(category){
            filter.category=category;
        }
        if(startDate||endDate){
            filter.date={};
            if(startDate)filter.date.$gte=new Date(startDate);
            if(endDate)filter.date.$lte=new Date(endDate);
        }
        //to get all the expenses
        const expenses=await Expense.find(filter).sort({date:-1});
        //to calculate the total
        const total=expenses.reduce((sum,exp)=>sum+exp.amount,0);
        //returning the response
        return res.status(200).json({
            count:expenses.length,
            total,
            expenses
        });
    }catch(error){
        console.error(`Error in getting the expense`,error);
        return res.status(500).json({message:'server error in the getExpense so try again'});

    }
};
const updateExpense=async(req,res)=>{
   try{
       const {id}=req.params;
       const expense=await Expense.findOne({_id:id,userId:req.userId});
       if(!expense){
        return res.status(404).json({message:'No expense found'});
       }
       const {category,description,amount,date}=req.body;
       if(amount!==undefined)expense.amount=amount;
       if(category!==undefined)expense.category=category;
       if(description!==undefined)expense.description=description;
       if(date!==undefined)expense.date=date;

       await expense.save();

       return res.status(200).json({
        message:'Expense updated Successfully',
        expense
       });
   }catch(error){
    console.error('updateExpense errror:',error);
    return res.status(500).json({message:'Server error please try again'});
   }
};
const deleteExpense=async(req,res)=>{
    try{
        const {id}=req.params;
        const expense=await Expense.findOneAndDelete({_id:id,userId:req.userId});
        if(!expense){
            return res.status(404).json({message:'Expense Not Found'});
        }
        return res.status(200).json({message:'Expense deleted successfully'});
    }
    catch(error){
        console.error('deleteExpense error:',error);
        return res.status(500).json({message:'Server error try again'});
    }
};

//exporting the modules
module.exports={createExpense,getExpense,updateExpense,deleteExpense};