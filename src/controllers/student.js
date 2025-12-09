import { asyncHandler } from "../utils/asyncHandler.js";
import { Course } from "../models/course.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Lecture } from "../models/lacture.js";
import { User } from "../models/user.js";
import { Performance } from "../models/performance.js";

const getEnrolledCourse=asyncHandler(async(req,res)=>{
      const studentId=req.user._id;
      const enrolledCourse= await Course.find({
         studentsEnrolled:{
          $elemMatch:{
              studentId:studentId,
              status:'approved'
          }
         }
      })
      if(enrolledCourse.length===0){
        throw new apiError(404,"Don't have any enrolled course!")
      }
      return res.status(200)
      .json(
        new apiResponse(200,enrolledCourse,"All enrolled course fatch successfully")
      )
})



const allNotEnrolledCourse=asyncHandler(async(req,res)=>{
      const studentId=req.user._id;
      const NotenrolledCourse= await Course.find({
         studentsEnrolled:{
          $not:{
            $elemMatch:{
              studentId:studentId,
            }
          }
         }
      })
      if(!NotenrolledCourse.length){
        throw new apiError(404,"Don't have any available course!")
      }
      return res.status(200)
      .json(
        new apiResponse(200,NotenrolledCourse,"All not enrolled course fatch successfully")
      )
})

 
const getPendingCourse=asyncHandler(async(req,res)=>{
      const studentId=req.user._id;
      const pendingCourse= await Course.find({
         studentsEnrolled:{
          $elemMatch:{
              studentId:studentId,
              status:'pending'
          }
         }
      })
      if(pendingCourse.length===0){
        throw new apiError(404,"Don't have any pending course!")
      }
      return res.status(200)
      .json(
        new apiResponse(200,pendingCourse,"All pending course fatch successfully")
      )
})

const getCourseLecture=asyncHandler(async(req,res)=>{
    const {courseId}=req.params
    if(!courseId){
      throw new apiError(404,"CourseId is not found!")
    }
    const allecture=await Lecture.findById({courseId})

    if(!allecture||allecture.length===0){
      throw new apiError(404, "No MCQs found for this lecture");
    }
    return res.status(200)
    .json(
      new apiResponse(200, allecture, "All MCQs fetched successfully!")
    )
})

const addPerformance=asyncHandler(async(req,res)=>{
    const studentId=req.user._id;
    const student=await User.findById(studentId);
    if(!student|| student.role!=='student'){
       throw new apiError(401,"User is not valid!")
    }
    const {courseId,lectureId}=req.body;
    if(!courseId||!lectureId){
       throw new apiError(400,"Course id and lecture id are not valid!")
    }
    const performance=await Performance.findOne({
      studentId,
      courseId
    })
    if(!performance){
      throw new apiError(400,"Can't find performance")
    }
    if(performance.completeLectures.includes(lectureId)){
      return res.status(200)
      .json(200,performance,"Performance already recorded!")
    }
    
    performance.completeLectures.push(lectureId);
    performance.save({validateBeforeSave:false})
    return res.status(200)
    .json(200,performance,"Performance recorded successfully!")
})

const getYourPerformance=asyncHandler(async(req,res)=>{
    const studentId=req.user._id;
    const student=await User.findById(studentId);
    if(!student|| student.role!=='student'){
       throw new apiError(401,"User is not valid!")
    }
    const {courseId}=req.params;

    const performance=await Performance.findOne({
       studentId,
       courseId
    })
    
    if(!performance){
      throw new apiError(400, "Can't find performance for this course!");
    }
    const allLecture=(await Lecture.find({courseId}))
    if(!allLecture||allLecture.length===0){
      throw new apiError(404, "Lectures not found for this course!");
    }
   allLectureLength=allLecture.length
    const completeLecturesLength=performance[0].completeLectures.length
    const coursePerformancePercentage=(completeLecturesLength*100)/allLectureLength

    return res.status(200)
    .json(
      new apiResponse(200,{
         coursePerformancePercentage,
         allLectureLength,
         performance
      },"Course performance fetched successfully!")
    )
    
})

 

export {
  getEnrolledCourse,
  allNotEnrolledCourse,
  getPendingCourse,
  getCourseLecture,
  addPerformance,
  getYourPerformance,
}