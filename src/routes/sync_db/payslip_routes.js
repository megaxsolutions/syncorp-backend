import { Router } from "express";
import * as PayslipController  from '../../controllers/sync_db/payslip_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const payslipRoutes = Router();


payslipRoutes.get('/get_all_payslip', PayslipController.get_all_payslip);


export default payslipRoutes;
