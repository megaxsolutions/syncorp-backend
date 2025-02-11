import { Router } from "express";
import * as recoveryController  from '../controllers/recovery_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const recoveryRoutes = Router();

recoveryRoutes.post('/send_otp', recoveryController.otp_recovery);
recoveryRoutes.post('/otp_verification/:emp_id', recoveryController.otp_verification);
recoveryRoutes.put('/account_recovery/:emp_id/:type', recoveryController.account_recovery);


export default recoveryRoutes;
