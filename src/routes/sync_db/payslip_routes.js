import { Router } from "express";
import * as PayslipController  from '../../controllers/sync_db/payslip_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const payslipRoutes = Router();


payslipRoutes.get('/get_all_payslip', PayslipController.get_all_payslip);
payslipRoutes.get('/get_all_user_payslip/:emp_id/:cutoff_id', PayslipController.get_all_user_payslip);
payslipRoutes.get('/get_all_user_payslip_admin/:cutoff_id', PayslipController.get_all_user_payslip_admin);



export default payslipRoutes;
