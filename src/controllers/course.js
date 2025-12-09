import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary ,deleteOnCloudinary} from "../utils/cloudinary.js";
import {Course} from "../models/course.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Lecture } from "../models/lacture.js";
import { User } from "../models/user.js";
import { Bank } from "../models/bank.js";
import bcrypt from 'bcrypt'
import { Transaction } from "../models/transaction.js";
import { Performance } from "../models/performance.js";


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

// const deleteCourse=asyncHandler(async(req,res)=>{
//     const id = req.params.id;
//     const course = await Course.findOne({ _id: id, createdBy: req.user._id });
//     if(!course){
//        throw new apiError(403, "You are not allowed to delete this course!");
//     }
//     await Course.findByIdAndDelete(id);
//      return res.status(200).json(
//       new apiResponse(200, null, "Course deleted successfully")
//     );

// })


const addLectureHandler=asyncHandler(async(req,res)=>{
    const { title, description,resourseType} = req.body || {};

    const courseId = req.params.couserId || req.params.courseId || req.params.id;

    if (!title || !description ||!resourseType) {
       throw new apiError(400, "All fields are required: title, description");
    }

    const resourceLocalPath=req.file?.path;

    if(!resourceLocalPath){ 
        throw new apiError(400,"Resourse files is required!")
     }

    const user =await User.findById(req.user._id).select('-password -refreshToken')
    
    if(!user){
      throw new apiError(404,"User is not found!")
    }

    if(user.role==='student'){
        throw new apiError(401,"Student cann't get access to add course")
    }
    
    const course = await Course.findById(courseId);

    if(!course){
        throw new apiError(401,"Course ID is invalid ")
    }

    const resource=await uploadOnCloudinary(resourceLocalPath);

    if(!resource){
      throw new apiError(400,"Resourse files is required!")
    }

    const createLecture=await Lecture.create({
      couserId: courseId,
      title,
      description,
      resourseType,
      resource:resource.url,
    })
    

    const findLecture=await Lecture.findById(createLecture._id);

    if(!findLecture){
      throw new apiError(500,"Something was wrong while create Lecture!")
    }
    
    res.status(201).json(
        new apiResponse(200,findLecture,"Lecture create successfully!") 
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

    const {courseId} =body
 

    const lecture = await Lecture.findByIdAndUpdate(
      { 
        _id: req.params.id,
         courseId

      },
      { 
        $set: { ...updatefeilds } 
      },
      { 
        new: true
      }
    )
     
    if(!lecture){
      throw new apiError(404,"Lecture is not found!")
    }

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

   const {lectureId,couserId,resourseType} = req.body;

   const resourceLocalPath=req.file?.path;

   if(!resourceLocalPath){
      throw new apiError(400,"Resource file is not found!");
   }
   console.log(lectureId)
   console.log(couserId)
   const lecture=await Lecture.findOne({_id:lectureId,couserId});
  
   if (!lecture) {
    throw new apiError(404, "Lecture not found!");
  }


   if(!lecture?.resource){
      throw new apiError(400, "No previous resource found in DB!");
   }

  const deleteResourse = await deleteOnCloudinary(lecture?.resource);

   if(!deleteResourse){
       throw new apiError(400, "Failed to delete previous resource from Cloudinary");
   }    

   const resource=await uploadOnCloudinary(resourceLocalPath);

   if(!resource.url){
      throw new apiError(400, "Failed to upload resource!");
   }
   
   const updatelacture =await Lecture.findByIdAndUpdate(
      { _id: lectureId, courseId:couserId},
     {
      $set:{
         resourseType:resourseType,
         resource:resource.url
      }
     },{
       new:true
     }
   )
   return res.status(200)
   .json(
     new apiResponse(200,updatelacture,"Resource update successfully!")
   )
})

// const deleteLecture = asyncHandler(async (req, res) => {
//   const { couserId, id } = req.params;

//   // Optional: validate ObjectId
//   if (!id || !couserId) {
//     throw new apiError(400, "couserId and id are required in params");
//   }

//   const lecture = await Lecture.findOne({ _id: id, courseId: couserId });
//   if (!lecture) {
//     throw new apiError(404, "Lecture not found or access denied!");
//   }

//   await Lecture.findByIdAndDelete(id);
//   return res.status(200).json(
//     new apiResponse(200, null, "Lecture deleted successfully")
//   );
// });

const toEnrolledCourse=asyncHandler(async(req,res)=>{

  const courseId=req.params.id||req.params.courseId;

  const {provider,accountNumber,secretKey}=req.body;

  if(!provider||!accountNumber||!secretKey){
     throw new apiError(400,"Provider, Account Number and Secret Key are required!");
  }

  const user=await User.findById(req.user._id).select("-password -refreshToken");

  if(!user){ 
    throw new apiError(404,"User not found");
  }

  const userbank=await Bank.findOne({userId:req.user._id});

  if(!userbank){
   throw new apiError(400,"Bank account not found!");
  }
    
  console.log(userbank.accountNumber)
  console.log(accountNumber)
  if(userbank.accountNumber!==accountNumber){
    throw new apiError(400,"Account Number is not valid!");
  }

  const isTrue=await bcrypt.compare(secretKey,userbank.secretKey);

  if(!isTrue){
     throw new apiError(400,"Secret key is not valid!");
  }
  const course=await Course.findById(courseId);

  if(!course){
    throw new apiError(404,"Course is not found");
  }

  const alreadyEnrolled=course.studentsEnrolled.some(s=>s.studentId.toString()===req.user._id.toString());

  if(alreadyEnrolled){
    throw new apiError(400,"Student already enrolled");
  }

  if(userbank.balance<course.price) {
    throw new apiError(400,"Balance is not sufficient!");
  }
  const admin=await User.findOne({role:"admin"});

  if(!admin){
     throw new apiError(400,"Admin not found!");
  }

  const adminbank=await Bank.findOne({userId:admin._id});

  if(!adminbank){
    throw new apiError(400,"Admin bank account not found!");
  }

  userbank.balance-=course.price; 
  await userbank.save();

  adminbank.balance+=course.price;
  await adminbank.save();

  course.studentsEnrolled.push({studentId:req.user._id,status:"pending"});

  await course.save({validateBeforeSave:false});

  const instructorId=course.createdBy;

  const instructor=await User.findById(instructorId).select("-password -refreshToken");

  if(!instructor) {
    throw new apiError(400,"Instructor not found!");
  }

  let adminCommission=0, instructorShare=0;

  if(admin._id.toString()===instructorId.toString()) {
    adminCommission=course.price;
  }
  else {
    adminCommission=0.2*course.price;
   instructorShare=0.8*course.price;
  }
  const transaction=await Transaction.create({
    adminId:admin._id,
    courseId,
    courseName:course.title,
    instructorId,
    instructorName:instructor.fullname,
    instructorEmail:instructor.email,
    userId:req.user._id,
    userName:user.fullname,
    userEmail:user.email,
    totalAmount:course.price,
    adminCommission,
    instructorShare,
    provider,status:"pending",
    bankRefId:"REF-"+Date.now()
  });

  if(!transaction){
    throw new apiError(400,"Transaction could not be created!");
  }
  const performance=await Performance.create({
          courseId:courseId,
          completeLectures:[],
          studentId:req.user._id
      })
  
  if(!performance){
     throw new apiError(400,"Performance could not be created!");
  }
  return res.status(200)
  .json(
    new apiResponse(200,{course,transaction},"Student enrolled and transaction created!")
  );
});



export {
   addCourseHandler,
   updatecourseInfo,
   updateImage,
  //  deleteCourse,
   addLectureHandler,
   updateLactureInfo,
   updateResource,
   //deleteLecture,
   toEnrolledCourse
}