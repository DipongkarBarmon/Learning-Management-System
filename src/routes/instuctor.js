
import { Router } from "express";
import {getMyCourse,getAllCourse} from "../controllers/instructor.js"
import varifyJwt from "../middlewares/authorization.js";

import {createMcq,getLectureMcq} from "../controllers/mcq.js"

const router=Router();

router.route('/all-course').get(varifyJwt,getAllCourse)

router.route('/my-course').get(varifyJwt,getMyCourse)
router.route('/create-mcq').post(varifyJwt,createMcq)
router.route('/get-mcq/:lectureId').get(varifyJwt,getLectureMcq)


export default router;