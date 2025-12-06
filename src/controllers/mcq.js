import { MCQ } from "../models/mcq.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createMcq=asyncHandler(async(req,res)=>{
    const {question,option,correctAns}=req.body
    const lectureId=req.params;

    if(!question||!option|| !correctAns){
       throw new apiError(400,"All fields are required")
    }

    const mcq=await MCQ.create(
       {
          lectureId,
          question,
          option,
          correctAns
       }
    )
    const findMcq=await MCQ.findById(mcq._id)

    if(!findMcq){
      throw new apiError(200,"MCQ is not created!")
    }

    return res.status(200)
    .json(
      new apiResponse(200,mcq,"")
    )
})


const getLectureMcq=asyncHandler(async(req,res)=>{
   const {lectureId}=req.params
   const allmcq=await MCQ.find({lectureId});
   if(!allmcq||allmcq.length===0){
     throw new apiError(404, "No MCQs found for this lecture");

   }
   return res.status(200)
   .json(
    new apiResponse(200, allmcq, "All MCQs fetched successfully!")
   )
})



export {
  createMcq,
  getLectureMcq,
}