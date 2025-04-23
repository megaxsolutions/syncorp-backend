import { Router } from "express";
import * as EligibleAttendanceIncentiveController  from '../../controllers/sync_db/eligible_att_incentive_controller_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const eligibleAttendanceIncentive = Router();

eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive_employees', EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_employees);
eligibleAttendanceIncentive.delete('/delete_eligible_att_incentive/:eligible_att_incentive_id', EligibleAttendanceIncentiveController.delete_eligible_att_incentive);
eligibleAttendanceIncentive.put('/update_eligible_att_incentive/:eligible_att_incentive_id', EligibleAttendanceIncentiveController.update_eligible_att_incentive);
eligibleAttendanceIncentive.post('/add_eligible_att_incentive', EligibleAttendanceIncentiveController.create_eligible_att_incentive);
eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive/:cutoff_id', EligibleAttendanceIncentiveController.get_all_eligible_att_incentive);
eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive_supervisor/:cutoff_id/:supervisor_emp_id', EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_supervisor);

export default eligibleAttendanceIncentive;
