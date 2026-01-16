// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config();

connectDB()
.then(()=>{
     const PORT=process.env.PORT||8000
    //  app.on(error,(error)=>{
    //      console.log('Error',error)
    //  })
    app.listen(PORT,()=>{
       console.log(`Server Started at:http://localhost:${PORT}`);
    })
})
.catch((error)=>{
   console.log("Error:",error)
}) 


/*
import mongoose from "mongoose"
import { DB_name } from "./constants.js"

import express from "express"

const app=express()

(async()=>{
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`);
    app.on('error',(error)=>{
        console.log("Error:",error)
        throw errorimport (app)
    });
    

    app.listen(process.env.PORT,()=>{
       console.log(`Server Started at:http:/localhost:${process.env.PORT}`)
    })
    
  } catch (error) {
      console.log("Error:",error)
      throw error
  }
})()
  */
