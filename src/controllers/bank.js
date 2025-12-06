import { User } from "../models/user.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt"

const setUpBank=asyncHandler(async(req,res)=>{
     const {accountNumber,secretKey}=req.body;
     if(!accountNumber || !secretKey){
       throw new apiError(400,"Account Number and Secret key is required!")
     }
     const id=req.user._id;
     const user=await User.findById(id).select('-password -refreshToken');
     if(!user){
        throw new apiError(404,"User is not found!")
     }  
     const hashedSecret=await bcrypt(secretKey,10);
     user.accountNumber=accountNumber;
     user.secretKey=hashedSecret;
     user.save({validateBeforeSave:false});

     return req.status(200)
     .json(
      new apiResponse(200,user,"Setup Bank account successfully!")
     )
     
})
const  addbalance=asyncHandler(async(req,res)=>{
     const {balance,secretKey}=req.body
     const id=req.user._id;
    
     if(balance===undefined||balance<0||!secretKey){
       throw new apiError(400,"Balance and secretkey is required!")
     }
     const user=await User.findById(id).select('-password -refreshToken');
     if(!user){
       throw new apiError(404,"User is not found!")
     }
     const isTrue= await bcrypt.compare(user.secretKey,secretKey);
     if(!isTrue){
        throw new apiError(400,"secretkey is not vailed!")
     }
     user.balance+=balance;
     user.save({validateBeforeSave:false})
     return res.status(200)
     .json(
       new apiResponse(200,user,"Balance update successfully")
     )
})

const checkAccount=asyncHandler(async(req,res)=>{
    const id=req.user._id;
    const user=await User.findById(id).select('password -refreshToken -secretkey')
    if(!user){
      throw new apiError(404,"User is not found!")
    }
    return req.status(200)
    .json(
      new apiResponse(200,user,"Account Check successfully")
    )
})

export {
  setUpBank,
  addbalance,
  checkAccount,
}