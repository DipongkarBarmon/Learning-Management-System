import mongoose,{Schema} from "mongoose";

const lectureSchema=new mongoose.Schema({
    courseId:{ 
      type:mongoose.Schema.Types.ObjectId, 
      ref:"Course" 
    },
    title:{
      type:String,
      required:true,
    },
    resourseType:{
       type:String,
       emum:['vedio','audio','picture','document'],
       retuired:true
    },
    resource:{
       type:String,
       required:true
    },
    description:{
       type:String
    }
},{timestamps:true});

export const Lecture=mongoose.model('lacture',lectureSchema)
