import { Router } from "express";
import {addCourseHandler,
   updatecourseInfo,
   updateImage,
   addLectureHandler,
   updateLactureInfo,
   updateResource,
   toEnrolledCourse
} from "../controllers/course.js"
import varifyJwt from "../middlewares/authorization.js";
import { upload } from "../middlewares/multer.js";

   
const router=Router();

router.route('/add-course').post(varifyJwt,upload.single('image'),addCourseHandler)

router.route('/updatecourseInfor/:id').patch(varifyJwt,upload.none(),updatecourseInfo)

router.route('/updatecourseImage/:id').patch(varifyJwt,upload.single('image'),updateImage)

// router.route('/deleteCourse/:id').delete(varifyJwt,deleteCourse)

router.route('/course/:couserId/add-lecture').post(varifyJwt,upload.single('resource'),addLectureHandler)

router.route('/course/updateLectureInfo/:id').patch(varifyJwt,upload.none(),updateLactureInfo)

router.route('/course/updateLectureResource').patch(varifyJwt,upload.single('resource'),updateResource)

// router.route('/course/deleteLecture').delete(varifyJwt,deleteLecture)


router.route("/enrolled/:id").post(varifyJwt,upload.none(),toEnrolledCourse)


export default router;