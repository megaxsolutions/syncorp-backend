import { Router } from "express";
import * as AdjustmentController  from '../controllers/adjustment_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const adjustmentRoutes = Router();


adjustmentRoutes.post('/add_adjustment/:attendance_id', AdjustmentController.create_adjustment);
adjustmentRoutes.put('/update_adjustment/:adjustment_id', AdjustmentController.update_adjustment);
adjustmentRoutes.put('/update_approval_adjustment/:adjustment_id', AdjustmentController.update_approval_adjustment);
adjustmentRoutes.delete('/delete_adjustment/:adjustment_id', AdjustmentController.delete_adjustment);
adjustmentRoutes.get('/get_all_adjustment', AdjustmentController.get_all_adjustment);
adjustmentRoutes.get('/get_all_user_adjustment/:emp_id', AdjustmentController.get_all_user_adjustment);



export default adjustmentRoutes;
