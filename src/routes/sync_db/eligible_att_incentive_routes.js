import { Router } from "express";
import * as EligibleAttendanceIncentiveController  from '../../controllers/sync_db/eligible_att_incentive_controller_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const eligibleAttendanceIncentive = Router();

eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive/:cutoff_id', EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_test);
eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive_supervisor/:supervisor_emp_id', EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_supervisor);
//eligibleAttendanceIncentive.get('/add_eligible_att_incentive_monthly', EligibleAttendanceIncentiveController.create_eligible_att_incentive);

export default eligibleAttendanceIncentive;
