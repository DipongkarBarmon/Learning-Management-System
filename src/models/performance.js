import mongoose,{Schema} from "mongoose";
 

const performanceSchema=new Schema({
  courseId:{
    type:Schema.Types.ObjectId,
    ref:'course'
  },
  completeLectures:[{
      type:Schema.Types.ObjectId,
      ref:'lecture'
  }],
  studentId:{
    type:Schema.Types.ObjectId,
    ref:'user'
  }
},{timestamps:true})

export const Performance=mongoose.model('performance',performanceSchema)
