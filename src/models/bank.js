import mongoose,{Schema} from "mongoose";

const bankSchema = new Schema({
  userId:{
     type:Schema.Types.ObjectId,
     ref:"user"
  },
  provider:{
    type:String,
    enum:["bkash","Nagad"],  
    required:true,
  },
  accountNumber:{
    type:String,
    required:true,
    match:/^[0-9]{11}$/,
  },
  accountHolderName:{
    type:String,
    required:true,
    trim:true,
  },
  secretKey:{
    type:String,
    required:true
  },
  balance: {
    type:Number,
    default:0,
    min:0,
  }
},{timestamps:true});

export  const Bank = mongoose.model("bank", bankSchema);
