 
import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import JWT from 'jsonwebtoken'
 

const userSchema=new Schema({
    fullname:{
        type:String,
        required:true,
        lowecase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
        index:true
    },
    phoneNumber:{
        type:String,
        match: /^01[3-9]\d{8}$/,
    },
    avatar:{
      type:String,
      required:true
    },
    role:{
       type:String,
      enum:["student","instructor","admin"],
      default:"student"
    },
    password:{
      type:String,
      required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    },
    accountNumber:{
      type:Number,
       
    },
    secretKey:{
       type:String,
        
    },
    balance:{
      type:Number,
      default:0
    }
},{timestamps:true});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
   return;
  }
  const hashedPassword =await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
});

userSchema.methods.isPasswordCorrect=async function(password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
   return JWT.sign(
    {
      _id:this._id,
      fullname:this.fullname,
      username:this.username,
      email:this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
   )
}
userSchema.methods.generateRefreshToken=function(){
  return JWT.sign(
    {
      _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
   )
}

export const User=mongoose.model('user',userSchema);

