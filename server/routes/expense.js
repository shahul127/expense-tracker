const express=require('express');
const router=express.Router();
const verifyToken = require('../middleware/verifyToken');
const {createExpense,getExpense,updateExpense,deleteExpense}=require('../controller/expenseController');


router.post('/',verifyToken,createExpense);
router.get('/',verifyToken,getExpense);
router.put('/:id',verifyToken,updateExpense);
router.delete('/:id',verifyToken,deleteExpense);

module.exports=router;