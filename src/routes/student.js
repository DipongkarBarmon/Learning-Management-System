import { Router } from "express";
import {getEnrolledCourse,
  allNotEnrolledCourse,
  
} from '../controllers/student.js'

import varifyJwt from "../middlewares/authorization.js";
import { upload } from "../middlewares/multer.js";
const router=Router()

router.route('/my-course').get(varifyJwt,upload.none(),getEnrolledCourse)
router.route('/availabe-course').get(varifyJwt,upload.none() ,allNotEnrolledCourse)

 


export default router;