import mongoose ,{Schema} from "mongoose";

const courseSchema=new Schema({
   title:{
     type:String,
     required:true
   },
   description:{
     type:String,
     required:true,
   },
   price:{
      type:Number,
      required:true
   },
   image:{
      type:String,
      required:true
   },
   studentsEnrolled:[{
      studentId:{ 
        type:mongoose.Schema.Types.ObjectId, 
        ref:"user"
        },
      status: { 
         type: String,
         enum: ["pending", "approved", "rejected"],
         default: "pending"
      }
    }],
   createdBy:{
     type:Schema.Types.ObjectId,
     ref:"user"
   },
   adminId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
   },
   totalEnrollment:{
      type:Number,
      default:0
   }
},{timestamps:true})

export const Course=mongoose.model('course',courseSchema);