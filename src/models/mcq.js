import mongoose,{Schema} from "mongoose";

const mcqSchema=new Schema({
   lectureId:{
     type:Schema.Types.ObjectId,
     ref:'lecture',
     required:true
   },
   question:{
     type:String,
     required:true
   },
   options:[
    { 
      type:String,
      required:true
    }
   ],
   correctAns:{
     type:String,
     required:true
   }

},{timestamps:true})

export const MCQ=mongoose.model('mcq',mcqSchema)