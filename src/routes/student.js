import { Router } from "express";
import {getEnrolledCourse,
  allNotEnrolledCourse,
  
} from '../controllers/student.js'
import varifyJwt from "../middlewares/authorization.js";
const router=Router()

router.route('/my-course').get(varifyJwt,getEnrolledCourse)
router.route('/availabe-course').get(varifyJwt,allNotEnrolledCourse)

 


export default router;