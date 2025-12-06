import { Course } from "../models/course.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.js";

const getPandingCourse=asyncHandler(async(req,res)=>{
     const adminID=req.user._id;
     const pendingCourse=await Course.find({
       adminID:adminID,
       "studentsEnrolled.status":'pending'
     }).populate("studentsEnrolled.studentId");
     if(!pendingCourse||pendingCourse.length===0){
        throw new apiError(404,"Pending course not found!")
     }
     return res.status(200)
     .json(
      new apiResponse(200,pendingCourse,"Fatched pending course successfully")
     )
})



const approvedOrReject=asyncHandler(async(req,res)=>{
     const status=req.body
    const {courseId,studentId}=req.params;
    const course=await Course.findById(courseId)
    if(!course){
      throw new apiError(404,"Course is not found")
    }

    const instructorId=course.createdBy
    const instructor=await User.findById(instructorId)
    if(!instructor){
      throw new apiError(404,"Instructor is not found!")
    }

    const admin=await User.findById(req.user._id)
    if(!admin){
      throw new apiError(404,"Admin is not found!")
    }

    const student=await User.findById(studentId);
       if(!student){
      throw new apiError(404,"Student is not found!")
    }
    if(student.balance<course.price){
       throw new apiError(402,"Balance insufficient!")
    }
    if(status==='accepted'){
      student.balance-=price;
      admin.balance+=price*0.25;
      instructor.balance+=price*0.75
      student.save({validateBeforeSave:false})
      admin.save({validateBeforeSave:false})
      instructor.save({validateBeforeSave:false})
      
      const performance=await Performance.create({
          CourseId:courseId,
          completeLectures:[],
          studentId:studentId
      })
      
      return res.status(200).
      json(
        new apiResponse(200,performance,"Performance created successfully!")
      )

    }

    const updatecourse=await Course.findByIdAndUpdate(
        courseId,
        {
          $push:{
            studentsEnrolled:{
              status:status
            }
          }
        },
        {
          new:true
        }
    )
    if(!updatecourse){
      throw new apiError(400,"Connt't update course status!")
    }

    return res.status(200)
    .json(200,updatecourse,"Accept or Reject excute successfully!")
})


export {
   getPandingCourse,
   approvedOrReject
}
