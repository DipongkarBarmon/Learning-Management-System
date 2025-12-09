import { Bank } from "../models/bank.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt"
import { Transaction } from "../models/transaction.js";
import { Course } from "../models/course.js";

const setUpBank=asyncHandler(async(req,res)=>{

     const {provider, accountNumber,accountHolderName,balance,secretKey}=req.body;

     if(!accountNumber || !secretKey||!provider||!accountHolderName||balance===undefined||balance===null){
       throw new apiError(400, "All fields are required to setup bank information!");
     }

     if(balance < 0){
       throw new apiError(400,"Balance must be positive!")
     }

     const id=req.user._id;

     const user=await User.findById(id).select('-password -refreshToken');

     if(!user){
        throw new apiError(404,"User is not found!")
     }  

     if(user.bankAccountCreated){
       throw new apiError(400,"Bank acount all ready created!")
     }

     const hashedSecret=await bcrypt.hash(secretKey,10);
     console.log(hashedSecret)
     if(!hashedSecret){
       throw new apiError(400,"Secret Key cann't hashed!")
     }
     
     const bank =await Bank.create({
          userId:id,
          provider,
          accountNumber,
          accountHolderName,
          balance,
          secretKey:hashedSecret
     })

    const checkBankInfo = await Bank.findById(bank._id).select('-secretKey')

     if(!checkBankInfo){
      throw new apiError(500, "Failed to create bank information!");
     }

     user.bankAccountCreated=true;

     user.save({validateBeforeSave:false})

     return res.status(200)
     .json(
      new apiResponse(200,checkBankInfo,"Setup Bank account successfully!")
     )
     
})

const  addbalance=asyncHandler(async(req,res)=>{
     const {balance,secretKey,accountNumber}=req.body
     const id=req.user._id;
    
     if(balance===undefined||balance<0||!secretKey||!accountNumber){
       throw new apiError(400, "Balance, account number, and secret key are required!");
     }
     const user=await User.findById(id).select('-password -refreshToken');
     if(!user){
       throw new apiError(404,"User is not found!")
     }
     
    const bank = await Bank.findOne({ userId: id })

     if(!bank){
        throw new apiError(404, "Bank account not found or not validated!");
     }

    const isTrue = await bcrypt.compare(secretKey, bank.secretKey);

     if(!isTrue){
        throw new apiError(400,"secretkey is not vailed!")
     }

    bank.balance = Number(bank.balance) + Number(balance);

    await bank.save({validateBeforeSave:false})

     return res.status(200)
     .json(
       new apiResponse(200,bank,"Balance update successfully")
     )
})

const checkAccount=asyncHandler(async(req,res)=>{
    const id=req.user._id;

    const user=await User.findById(id).select('-password -refreshToken')
     
    if(!user){
      throw new apiError(404,"User is not found!")
    }

    const bank=await Bank.findOne({userId:id}).select('-secretKey')
    
    if(!bank){
        throw new apiError(404, "Bank account not found or not validated!");
     }

    return res.status(200).json(
      new apiResponse(200,bank,"Account Check successfully")
    )
})

const getTransection=asyncHandler(async(req,res)=>{
    const instructorId=req.user._id;

    const transactions=await Transaction.findOne({instructorId})
    if(!transactions || transactions.length===0){
      throw new apiError(404,"No transactions found for this instructor")
   }

   return res.status(200)
   .json(
     new apiResponse(200,transactions,"Fatch all transactions by instructor id!")
   )
})

const instructorValidation=asyncHandler(async(req,res)=>{

    const {courseId,status}=req.body;
    if(!courseId||!status){
       throw new apiError(400,"All field are required!")
    }
    const course=await Course.findById(courseId)

    if(!course){
      throw new apiError(404,"Course is not found")
    }

    const instructorId=course.createdBy

    const instructor=await User.findById(instructorId)
    if(!instructor){
      throw new apiError(404,"Instructor is not found!")
    }

    const admin=await User.findOne({role:'admin'})

    if(!admin){
      throw new apiError(404,"Admin is not found!")
    }

     // Find bank by userId, not by bank document _id
     const instructorBank = await Bank.findOne({ userId: instructorId })
     if(!instructorBank){
       throw new apiError(404,"Instructor don't have any bank account")
     }

     const adminbank = await Bank.findOne({ userId: admin._id })
    if(!adminbank){
       throw new apiError(404,"Admin don't have any bank account")
    }
    
    const transaction = await Transaction.findOne({ instructorId: instructorId })

    if(!transaction){
       throw new apiError(404,"Transaction is not found!")
    }

    adminbank.balance-=transaction.instructorShare;
    instructorBank.balance+=transaction.instructorShare

    await adminbank.save({validateBeforeSave:false})
    await instructorBank.save({validateBeforeSave:false})
    transaction.status=status;
    await transaction.save({validateBeforeSave:false})

    // Update existing enrollment status from pending to provided status
    const updatecourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $set: { "studentsEnrolled.$[en].status": status }
      },
      {
        new: true,  
      }
    )
    if(!updatecourse){
      throw new apiError(400,"Connt't update course status!")
    }

    return res.status(200)
    .json(new apiResponse(200, updatecourse, "Accept or Reject execuite successfully!"))
})


export {
  setUpBank,
  addbalance,
  checkAccount,
  getTransection,
  instructorValidation
}