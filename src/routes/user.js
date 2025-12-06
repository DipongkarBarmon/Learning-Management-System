import { Router } from "express";
import { register,
  loginUser ,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvater
} from "../controllers/user.js";
import { upload } from "../middlewares/multer.js";
import varifyJwt from "../middlewares/authorization.js";
const router=Router();



router.route('/register').post(
  upload.any(),
  register)


router.route('/login').post(upload.none(),loginUser)

router.route('/logout').post(varifyJwt,logoutUser)

router.route('/refesh-token').post(refreshAccessToken)

router.route('/update-password').post(varifyJwt,upload.none(),changeCurrentPassword)

router.route('/update-account').post(varifyJwt,upload.none(),updateAccountDetails)

router.route('/change-profile').post(varifyJwt,upload.any(),updateUserAvater)

 
export default router;