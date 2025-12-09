import { Router } from "express";
import {setUpBank,addbalance,checkAccount,getTransection,instructorValidation} from '../controllers/bank.js'
import varifyJwt from "../middlewares/authorization.js";
import { upload } from "../middlewares/multer.js";
const router =Router();

router.route('/addBankInfo').post(varifyJwt,upload.none(),setUpBank)
router.route('/addBalace').post(varifyJwt,upload.none(),addbalance)
router.route('/chackAccount').get(varifyJwt,upload.none(),checkAccount)
router.route('/get-transaction').get(varifyJwt,upload.none(),getTransection)
router.route('/instructor-validation').post(varifyJwt,upload.none(),instructorValidation)

export default router;