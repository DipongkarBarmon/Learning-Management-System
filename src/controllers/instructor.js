import { Course } from "../models/course.js";
import { User } from "../models/user.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllCourse=asyncHandler(async(req,res)=>{
    const allCourse=await Course.find({})
    if(!allCourse){
      throw new apiError(404,"Don't have any course")
    }
    return res.status(200)
      .json(
        new apiResponse(200,allCourse,"Fatch all courses successfully!")
      )
})


const getMyCourse=asyncHandler(async(req,res)=>{
      
      const user=await User.findById(req.user._id)
      
      if(!user){
        throw new apiError(404,"user is not found!")
      }

      if(user.role!=='instructor'){

        throw new apiError(404,"user is not  valid!")
      }
      
      const course = await Course.find({ createdBy: req.user._id })

      if(!course){
        throw new apiError(404,"Course is not found!")
      }

      return res.status(200)
      .json(
        new apiResponse(200,course,"Fatch instructor courses successfully!")
      )
})



export {
  getAllCourse,
  getMyCourse,
}