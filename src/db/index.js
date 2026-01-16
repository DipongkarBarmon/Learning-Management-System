import mongoose from "mongoose";

import { DB_name } from "../constants.js";


const connectDB = async () => {
     try {
         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
         console.log(`\n MongoDB connected !! DB host: ${connectionInstance.connection.host}`)
     } catch (error) {
        console.log("MongoDB connection fail ",error)
        process.exit(1)
     }
} 

export default connectDB;