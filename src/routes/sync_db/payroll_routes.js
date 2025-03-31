import { Router } from "express";
import * as PayrollController  from '../../controllers/sync_db/payroll_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const payrollRoutes = Router();


payrollRoutes.get('/get_all_payroll', PayrollController.get_all_payroll);


export default payrollRoutes;
