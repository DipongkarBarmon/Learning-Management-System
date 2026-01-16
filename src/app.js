import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"

const app=express()

app.set('view engine','ejs')
app.set('views',path.resolve('./src/views'))


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))
app.use(cookieParser())


//router import
import userRouter from './routes/user.js'
import instructorRouter from './routes/course.js'
import studentRouter from './routes/student.js'
//router define

app.use('/api/v1/user',userRouter);
app.use('/api/v1/instructor',instructorRouter);
app.use('/api/v1/student',studentRouter)

export {app};