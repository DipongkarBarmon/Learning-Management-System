import mongoose,{Schema} from "mongoose";

const transactionSchema = new mongoose.Schema({
  adminId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
   },
  courseId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"course",
     required:true
     },
   courseName:{
    type:String,
    required:true,
   },
   instructorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
   },
   instructorName:{
     type:String,
     required:true
   },
   instructorEmail:{
     type:String,
     required:true
   },
   userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
   },
    userName:{
      type:String,
      required:true
   },
    userEmail:{
     type:String,
     required:true
   },
   totalAmount:{
    type:Number,
    required:true,
    min: 0
   }, 
  adminCommission:{ 
    type:Number, 
    default: 0 
  },
  provider:{
     type:String,
     required:true
  },
  instructorShare:{ 
    type:Number, 
    default: 0
   },
  status: {
    type: String,
    enum: ["pending", "approved",],
    default: "pending",
  },
  bankRefId:{
    type:String,
    trim:true
  }
},{timestamps:true});

export const Transaction = mongoose.model("transaction", transactionSchema);
