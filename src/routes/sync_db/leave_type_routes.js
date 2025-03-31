import { Router } from "express";
import * as LeaveTypeController  from '../../controllers/sync_db/leave_type_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const leaveTypeRoutes = Router();


leaveTypeRoutes.post('/add_leave_type', LeaveTypeController.create_leave_type);
leaveTypeRoutes.put('/update_leave_type/:leave_type_id', LeaveTypeController.update_leave_type);
leaveTypeRoutes.delete('/delete_leave_type/:leave_type_id', LeaveTypeController.delete_leave_type);
leaveTypeRoutes.get('/get_all_leave_type', LeaveTypeController.get_all_leave_type);




export default leaveTypeRoutes;
