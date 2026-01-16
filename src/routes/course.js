import { Router } from "express";
import {addCourseHandler,
   updatecourseInfo,
   updateImage,
   deleteCourse,
   addLectureHandler,
   updateLactureInfo,
   updateResource,
   deleteLecture,
   toEnrolledCourse
} from "../controllers/course.js"
import varifyJwt from "../middlewares/authorization.js";
import { upload } from "../middlewares/multer.js";

   
const router=Router();

router.route('/add-course').post(varifyJwt,upload.single('image'),addCourseHandler)
router.route('/updatecourseInfor/:id').patch(varifyJwt,upload.none(),updatecourseInfo)
router.route('/updatecourseImage/:id').patch(varifyJwt,upload.single('image'),updateImage)
router.route('/deleteCourse/:id').delete(varifyJwt,deleteCourse)

router.route('/course/:couserId/add-lecture').post(varifyJwt,upload.single('resource'),addLectureHandler)
router.route('/course/:couserId/updateLectureInfo/:id').patch(varifyJwt,upload.none(),updateLactureInfo)
router.route('/course/:couserId/updateLectureResource/:id').patch(varifyJwt,upload.single('resource'),updateResource)
router.route('/course/:couserId/deleteLecture/:id').delete(varifyJwt,deleteLecture)


router.route("/course/enrolled/:id").post(varifyJwt,toEnrolledCourse)


export default router;