 
import { apiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken'
import { User } from '../models/user.js';


const varifyJwt=asyncHandler(async(req,res,next)=>{
   
   try {
       const authHeader = req.get('Authorization');        // same as req.header(...)
      const tokenFromHeader = authHeader?.split(' ')[1];  // or authHeader?.replace('Bearer ', '')
      //console.log("fuck you",req.cookies)
      const token=req.cookies?.accessToken||tokenFromHeader; 
      
      if(!token){
        throw new apiError(401,"Unauthorized request")
      }
      const decoderUser=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user=await User.findById(decoderUser?._id).select('-password -refreshToken')
      if(!user){
        throw new apiError(404,"User is not found!")
      }
      req.user=user
      next()
   } catch (error) {
      throw new apiError(401,error?.message||"Cookie is not found")
   }
})

export default varifyJwt