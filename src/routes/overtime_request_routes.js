import { Router } from "express";
import * as OvertimeRequestController  from '../controllers/overtime_request_controller.js'; // Adjust the path as necessary
import { authenticateToken } from "../middleware/auth.js";


const overtimeRequestRoutes = Router();


overtimeRequestRoutes.post('/add_overtime_request', OvertimeRequestController.create_overtime_request);
overtimeRequestRoutes.put('/update_user_overtime_request/:overtime_request_id', OvertimeRequestController.update_user_overtime_request);
overtimeRequestRoutes.put('/update_approval_overtime_request/:overtime_request_id', OvertimeRequestController.update_approval_overtime_request);
overtimeRequestRoutes.put('/update_approval_overtime_request_admin/:overtime_request_id', OvertimeRequestController.update_approval_overtime_request_admin);
overtimeRequestRoutes.delete('/delete_overtime_request/:overtime_request_id', OvertimeRequestController.delete_overtime_request);
overtimeRequestRoutes.get('/get_all_overtime_request', OvertimeRequestController.get_all_overtime_request);
overtimeRequestRoutes.get('/get_all_overtime_request_supervisor/:supervisor_emp_id', OvertimeRequestController.get_all_overtime_request_supervisor);
overtimeRequestRoutes.get('/get_all_user_overtime_request/:emp_id', OvertimeRequestController.get_all_user_overtime_request);


export default overtimeRequestRoutes;
