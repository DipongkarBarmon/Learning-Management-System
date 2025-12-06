import { Router } from "express";
import {setUpBank,addbalance,checkAccount} from '../controllers/bank.js'

const router =Router();

router.route('addBankInfo').post(setUpBank)
router.route('addBalace').post(addbalance)
router.route('chackAccount').get(checkAccount)


export default router;