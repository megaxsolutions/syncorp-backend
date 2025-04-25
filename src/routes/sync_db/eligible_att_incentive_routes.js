import { Router } from "express";
import * as EligibleAttendanceIncentiveController  from '../../controllers/sync_db/eligible_att_incentive_controller_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const eligibleAttendanceIncentive = Router();

 
eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive_employees_cutoff/:cutoff_id', authenticateToken, EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_employees_cutoff);
eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive_employees', authenticateToken, EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_employees);
eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive_employees_supervisor/:supervisor_emp_id', authenticateToken, EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_employees_supervisor);
eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive_employees_supervisor_cutoff/:supervisor_emp_id/:cutoff_id', authenticateToken, EligibleAttendanceIncentiveController.get_all_eligible_att_incentive_employees_supervisor_cutoff);

eligibleAttendanceIncentive.delete('/delete_eligible_att_incentive/:eligible_att_incentive_id', authenticateToken, EligibleAttendanceIncentiveController.delete_eligible_att_incentive);
eligibleAttendanceIncentive.put('/update_eligible_att_incentive/:eligible_att_incentive_id', authenticateToken, EligibleAttendanceIncentiveController.update_eligible_att_incentive);
eligibleAttendanceIncentive.post('/add_eligible_att_incentive', authenticateToken, EligibleAttendanceIncentiveController.create_eligible_att_incentive);


eligibleAttendanceIncentive.get('/get_all_eligible_att_incentive/:cutoff_id', EligibleAttendanceIncentiveController.get_all_eligible_att_incentive);

export default eligibleAttendanceIncentive;
