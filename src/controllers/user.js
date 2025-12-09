
import { User } from '../models/user.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js';
import { uploadOnCloudinary,deleteOnCloudinary } from '../utils/cloudinary.js';
import {apiResponse} from '../utils/apiResponse.js'
import jwt from "jsonwebtoken"

 


const generateAccessTokenAndRefreshToken=async(userId)=>{
   try {

       const user=await User.findById(userId);

       const accessToken=user.generateAccessToken()

       const refreshToken=user.generateRefreshToken()

       user.refreshToken=refreshToken

       user.save({validateBeforeSave:false})

       return {accessToken,refreshToken}

   } catch (error) {
      throw new apiError(500,"Something want wrong while generating refreshToken and accessToken")
   }
}

const register=asyncHandler(async(req,res)=>{
     //get user details from frontent
     //validation -not empty
     //check user allready exists:user name,email
     //check for image ,check for avater
     //create user object-create entry in db
     //remove password and refresh token field from response
     //check for user creation 
     //return res

     const {fullname,email,phone,password,role}=req.body;

     if([phone,fullname,email,password,role].some((field)=>field?.trim()==="")){
        throw new apiError(400,"All fields are required")
     }

     const user=await User.findOne({$or:[{email}]})

      if(user){
          throw new apiError(409,"User already exists");
      }

      // Support both single-field and any-field multer setups
      let avatarLocalPath = req.file?.path;
      if (!avatarLocalPath && Array.isArray(req.files)) {
        const avatarFile = req.files.find((f) => f.fieldname === 'avatar');
        avatarLocalPath = avatarFile?.path;
      }

      //const coverImageLocalPath=req.files?.coverImage[0]?.path;
      // console.log(avaterLocalPath)

      if(!avatarLocalPath){ 
        throw new apiError(400,"Avatar files is required!")
      }

      const avatar=await uploadOnCloudinary(avatarLocalPath);
      
      if(!avatar){
         throw new apiError(400,"Avatar files is required!")
      }

      const createUser=await User.create({
        fullname,
        email,
        phoneNumber: phone,
        password,
        role,
        avatar:avatar.url,
      })


      const findUser=await User.findById(createUser._id).select("-password -refreshToken")

      if(!findUser){
        throw new apiError(500,"Something was wrong while registered the user")
      }
   
      res.status(201).json(
          new apiResponse(200,"User registered successfully!") 
      )
      
})

const loginUser=asyncHandler(async(req,res)=>{
     //get user datails from fontend
     //validation-not empty
     //find user
     //check user exist or not
     //check password
     //create accessToken and refreshToken
     //Send cookie

     const {email,password}=req.body
     //console.log("Email is ",email)

     if(!email){
       throw new apiError(400,"Email is required!")
     }
      const user=await User.findOne({$or:[{email}]})
     if(!user){
        throw new apiError(404,"User is not found!")
     }
     
      const isPasswordValid=await user.isPasswordCorrect(password)
      
     if(!isPasswordValid){
      throw new apiError(401,"Invalid user password")
     }

     const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);

     const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

     const options={
       httpOnly:true,
       secure:true
     }

      res.cookie('accessToken',accessToken,options)
     .cookie('refreshToken',refreshToken,options)
   
     return res.status(200)
     .cookie('accessToken',accessToken,options)
     .cookie('refreshToken',refreshToken,options)
     .json(
        new apiResponse(
          200,
          {
            user:loggedInUser,accessToken,refreshToken  
          },
          "User successfully login!"
        )
     )
     
})

const logoutUser=asyncHandler(async(req,res)=>{
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            refreshToken:undefined
          }
        },{
          new:true
        }
      )
      const options={
       httpOnly:true,
       secure:true
     }
     
     return res.status(200)
     .clearCookie('accessToken',options)
     .json(new apiResponse(200,{},"User logout successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const newComingRefreshToken=req.cookies?.refreshToken||req.body.refreshToken;

    if(!newComingRefreshToken){
      throw new apiError(401,"Unauthorized request")
    }
    try {
      const decodeToken=jwt.verify(newComingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
      const user=await User.findById(decodeToken?._id).select('-password')
      if(!user){
        throw new apiError(404,"User is not found and Invalid refrest token!")
      }
      if(newComingRefreshToken!=user?.refreshToken){
         throw new apiError(401,"Refesh Token is expired or used")
      }
      const {accessToken,newRefreshToken}=await generateAccessTokenAndRefreshToken(user._id);

     const options={
       httpOnly:true,
       secure:true
     }

     return res.status(200)
     .cookie('accessToken',accessToken,options)
     .cookie('refreshToken',newRefreshToken,options)
     .json(
        new apiResponse(
          200,
          {
             accessToken,refreshToken:newRefreshToken  
          },
          "Access Token Refresh!"
        )
     )
    
    } catch (error) {
       throw new apiError(401,error?.message||"Invalid refrest token!")
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user._id);
    
    const isPosswordValid=user.isPasswordCorrect(oldPassword);
    if(!isPosswordValid){
       throw new apiError(401,"Invalid old password")
    }
    user.password=newPassword;
    user.save({validateBeforeSave:false});
    return res.status(200)
    .json( 
       new apiResponse(200,{},"Password change Successfully!")
    )
})
 
const updateAccountDetails=asyncHandler(async(req,res)=>{
    
   //get details from body
   //validation - not empty
   //update user by req.user?._id 
   //return res
    
    const {fullname,email}=req.body;

    if(!fullname || !email){
       throw new apiError(400,"fullname and email are required!");
    }

    const user=await User.findByIdAndUpdate(
       req.user?._id,
       {
         $set:{
          fullname,
          email:email
         }
       },
       {
         new:true
       }
    ).select('-password -refreshToken')

    return res.status(200)
    .json(
      new apiResponse(200,user,"fullname and email update successfully")
    )
})

const updateUserAvater=asyncHandler(async(req,res)=>{
   //get avater from req.file?.path
   //validation check-not empty
   //upload into cloudinary
   //then update user by req.user?._id
   //return res
   
  let avatarLocalPath = req.file?.path;

  // if (!avatarLocalPath && Array.isArray(req.files)) {
  //   const avatarFile = req.files.find((f) => f.fieldname === 'avatar');
  //   avatarLocalPath = avatarFile?.path;
  // }

  if(!avatarLocalPath){
      throw new apiError(400,"Avater file is not found!");
   }

   const userfind=await User.findById(req.user?._id);

   if(!userfind?.avatar){
      throw new apiError(400,"Avater file is missing in DB!")
   }

   const deleteAvatar = await deleteOnCloudinary(userfind.avatar);

   if(!deleteAvatar){
      throw new apiError(400, 'Failed to delete previous avatar from Cloudinary');
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath);

   if(!avatar.url){
      throw new apiError(400,"Avater file is missing!")
   }

   const user =await User.findByIdAndUpdate(
     req.user?._id,
     {
      $set:{
        avatar:avatar.url
      }
     },{
       new:true
     }
   ).select('-password -refreshToken')

   return res.status(200)
   .json(
     new apiResponse(200,user,"Avater update successfully!")
   )
})

 

export {
  register,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvater,
}