import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary ,deleteOnCloudinary} from "../utils/cloudinary.js";
import {Course} from "../models/course.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Lecture } from "../models/lacture.js";
import { User } from "../models/user.js";
import bcrypt from 'bcrypt'


const addCourseHandler=asyncHandler(async(req,res)=>{
   const { title, description, price } = req.body || {};

   if (!title || !description) {
     throw new apiError(400, "All fields are required: title, description");

   }
   if(price<0 || price === undefined){
      throw new apiError(400, "Price must be > 0");
   }
   
   console.log(req.file)
   
  let imageLocalPath = req.file?.path;
   
   if (!imageLocalPath) { 
     throw new apiError(400, "Image file is required (field name: image)");
   }
   
   const user =await User.findById(req.user._id).select('-password -refreshToken')

   if(user.role==='student'){
      throw new apiError(401,"Student cann't get access to add course")
   }

   const image = await uploadOnCloudinary(imageLocalPath);
   if (!image) {
     throw new apiError(400, "Image upload failed");
   }

   const adminId=process.env.ADMIN_ID;

   const createCourse = await Course.create({
     title,
     description,
     price,
     image: image.url,
     createdBy:req.user._id,
     adminId
   })

   const findCourse = await Course.findById(createCourse._id);

   if (!findCourse) {
     throw new apiError(500, "Something went wrong while creating the course");
   }
 
   res.status(201).json(
     new apiResponse(200,findCourse, "Course created successfully!") 
   )
})


const updatecourseInfo=asyncHandler(async(req,res)=>{
  const allfeilds = ["title","description","price"];

  const updatefeilds = {};
  try {
    const body = req.body || {};
    console.log(body)
    allfeilds.forEach((info)=>{
      if (body[info] !== undefined && body[info] !== null && `${body[info]}` !== "") {
        updatefeilds[info] = body[info];
      }
    })

    const objectLength = Object.keys(updatefeilds).length;

    if (objectLength === 0) {
      throw new apiError(400, "No fields provided to update!");
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {   
        $set: {
          ...updatefeilds,
          createdBy: req.user._id
        }
      },
      { new: true }
    )

    return res.status(200).json(
      new apiResponse(200, course, "Information update successfully")
    )

  } catch (error) {
    throw new apiError(error.statusCode || 500, error.message);
  }
})

const updateImage=asyncHandler(async(req,res)=>{
   //get avater from req.file?.path
   //validation check-not empty
   //upload into cloudinary
   //then update user by req.user?._id
   //return res
  const id = req.params.id;

  let imageLocalPath=req.file?.path;
   
  if(!imageLocalPath){
      throw new apiError(400,"Image file is not found!");
   }
   
  const Coursefind = await Course.findById(id);
  
   if(!Coursefind?.image){
      throw new apiError(400,"Image file is missing in DB!")
   }

  const deleteImage = await deleteOnCloudinary(Coursefind.image);

   if(!deleteImage){
       throw new apiError(400, 'Failed to delete previous image from Cloudinary');
   }

   const image=await uploadOnCloudinary(imageLocalPath);

   if(!image.url){
      throw new apiError(400,"Image file is missing!")
   }

  const course = await Course.findByIdAndUpdate(
    id,
     {
      
      $set:{
         createdBy:req.user?._id,
         image:image.url
      }
     },{
       new:true
     }
   )

   return res.status(200)
   .json(
     new apiResponse(200,course,"Image update successfully!")
   )
   
})

const deleteCourse=asyncHandler(async(req,res)=>{
    const id = req.params.id;
    const course = await Course.findOne({ _id: id, createdBy: req.user._id });
    if(!course){
       throw new apiError(403, "You are not allowed to delete this course!");
    }
    await Course.findByIdAndDelete(id);
     return res.status(200).json(
      new apiResponse(200, null, "Course deleted successfully")
    );

})


const addLectureHandler=asyncHandler(async(req,res)=>{
    const { title, description} = req.body || {};
    const courseId=req.params
   if (!title || !description) {
     throw new apiError(400, "All fields are required: title, description");
   }
      const resourceLocalPath=req.file?.path;
        if(!resourceLocalPath){ 
          throw new apiError(400,"Resourse files is required!")
        }
     const user =await User.findById(req.user._id).select('-password -refreshToken')
      if(user.role==='student'){
          throw new apiError(401,"Student cann't get access to add course")
      }
        const resource=await uploadOnCloudinary(resourceLocalPath);
        if(!resource){
      throw new apiError(400,"Resourse files is required!")
      }

    const createLecture=await Lecture.create({
        couserId:courseId,
        title,
        description,
        resource:resource.url,
      })
      const findLecture=await Lecture.findById(createLecture._id);
      if(!findLecture){
        throw new apiError(500,"Something was wrong while create Lecture!")
      }
    
      res.status(201).json(
          new apiResponse(200,"Lecture create successfully!") 
      )
    
})

const updateLactureInfo=asyncHandler(async(req,res)=>{
  const allfeilds =["title","description"];
  const updatefeilds ={};
  try {
    const body = req.body||{};
    allfeilds.forEach((info)=>{
      if (body[info] !== undefined && body[info] !== null && `${body[info]}` !== "") {
        updatefeilds[info] = body[info];
      }
    })
    const objectLength = Object.keys(updatefeilds).length;
    if (objectLength === 0) {
      throw new apiError(400, "No fields provided to update!");
    }
    const { courseId, couserId } = req.params;
    const courseIdValue = courseId || couserId;
    const lecture = await Lecture.findByIdAndUpdate(
      { _id: req.params.id, courseId: courseIdValue },
      { $set: { ...updatefeilds } },
      { new: true }
    )
    return res.status(200).json(
      new apiResponse(200, lecture, "Information update successfully")
    )
  } catch (error) {
    throw new apiError(error.statusCode || 500, error.message);
  }
})

const updateResource=asyncHandler(async(req,res)=>{
   //get avater from req.file?.path
   //validation check-not empty
   //upload into cloudinary
   //then update user by req.user?._id
   //return res
   const { id, courseId } = req.params;

   const resourceLocalPath=req.file?.path;
   if(!resourceLocalPath){
      throw new apiError(400,"Resource file is not found!");
   }
   const lacturefind=await Lecture.findOne({_id:id,courseId});
   if(!lacturefind?.resource){
      throw new apiError(400,"Resource file is missing in DB!")
   }
  const deleteResourse = await deleteOnCloudinary(lacturefind.resource);
   if(!deleteResourse){
       throw new apiError(400, 'Failed to delete previous resource from Cloudinary');
   }    
   const resource=await uploadOnCloudinary(resourceLocalPath);
   if(!resource.url){
      throw new apiError(400,"resource file is missing!")
   }
   const lacture =await Lecture.findByIdAndUpdate(
     {_id:id,courseId},
     {
      $set:{
         resource:resource.url
      }
     },{
       new:true
     }
   )
   return res.status(200)
   .json(
     new apiResponse(200,lacture,"Resource update successfully!")
   )
})

const deleteLecture=asyncHandler(async(req,res)=>{
    const {id,courseId}=req.params;
    const lacture=Lecture.findOne(
      {_id:id,courseId}
    )
    if(!lacture){
       throw new apiError(403, "You are not allowed to delete this course!");
    }
    await Lecture.findByIdAndDelete(id);
     return res.status(200).json(
      new apiResponse(200, null, "Course deleted successfully")
    );

})

const toEnrolledCourse=asyncHandler(async(req,res)=>{
      const courseId=req.params;
      const {secretKey}=req.body
      if(!secretKey){
        throw new apiError(400,"Secret key is required!")
      }
      const user=await User.findById(req.user._id).select('-password -refreshToken')
      if(!user){
         throw new apiError(404,"User is not found");
      }
      const isTrue=bcrypt.compare(user.secretKey,secretKey)
      if(!isTrue){
           throw new apiError(400,"Secret key is not valid!")
      }
      const course=await Course.findById(courseId);
      if(!course){
         throw new apiError(404,"Course is not found")
      }
      course.studentsEnrolled.push({
        studentId:req.user._id,
        status:'pending'
      })
      course.save({validateBeforeSave:false});
      return res.status(200)
      .json(
        new apiResponse(200,"Secret key matched Student stutas update successfully!")
      )
})

export {
   addCourseHandler,
   updatecourseInfo,
   updateImage,
   deleteCourse,
   addLectureHandler,
   updateLactureInfo,
   updateResource,
   deleteLecture,
   toEnrolledCourse

}