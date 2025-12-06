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
  upload.single('avatar'),
  register)


router.route('/login').post(loginUser)

router.route('/logout').get(varifyJwt,logoutUser)

router.route('/refesh-token').post(refreshAccessToken)

router.route('/Updata-Password').post(varifyJwt,changeCurrentPassword)

router.route('/update-account').post(varifyJwt,updateAccountDetails)

router.route('/change-profile').post(varifyJwt,upload.single('avatar'),updateUserAvater)

 
export default router;