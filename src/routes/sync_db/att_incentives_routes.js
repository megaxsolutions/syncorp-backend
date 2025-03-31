import { Router } from "express";
import * as AttendanceIncentivesController  from '../../controllers/sync_db/att_incentive_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const attendanceIncentivesRoutes = Router();


attendanceIncentivesRoutes.post('/add_att_incentive', AttendanceIncentivesController.create_att_incentive);
attendanceIncentivesRoutes.put('/update_att_incentive/:att_incentive_id', AttendanceIncentivesController.update_att_incentive);
attendanceIncentivesRoutes.get('/get_all_att_incentive', AttendanceIncentivesController.get_all_att_incentive);
attendanceIncentivesRoutes.delete('/delete_att_incentive/:att_incentive_id', AttendanceIncentivesController.delete_att_incentive);


export default attendanceIncentivesRoutes;
