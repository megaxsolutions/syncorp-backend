import { Router } from "express";
import * as PayrollAdjustmentController  from '../../controllers/sync_db/payroll_adjustment_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const payrollAdjustmentRoutes = Router();

payrollAdjustmentRoutes.get('/get_all_payroll_adjustment', PayrollAdjustmentController.get_all_payroll_adjustment);
payrollAdjustmentRoutes.post('/add_payroll_adjustment', PayrollAdjustmentController.create_payroll_adjustment);
payrollAdjustmentRoutes.put('/update_payroll_adjustment/:payroll_adjustment_id', PayrollAdjustmentController.update_payroll_adjustment);
payrollAdjustmentRoutes.delete('/delete_payroll_adjustment/:payroll_adjustment_id', PayrollAdjustmentController.delete_payroll_adjustment);



export default payrollAdjustmentRoutes;


