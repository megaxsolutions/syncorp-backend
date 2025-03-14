import { Router } from "express";
import * as ShiftScheduleController  from '../controllers/shift_schedule_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const shiftscheduleRoutes = Router();


shiftscheduleRoutes.post('/add_shift_schedule_multiple_day_overtime', ShiftScheduleController.create_shift_schedule_multiple_day_overtime);
shiftscheduleRoutes.post('/add_shift_schedule_multiple_day', ShiftScheduleController.create_shift_schedule_multiple_day);
shiftscheduleRoutes.delete('/delete_shift_schedule_multiple_day_overtime/:schedule_type_id', ShiftScheduleController.delete_shift_schedule_multiple_day_overtime);
shiftscheduleRoutes.delete('/delete_shift_schedule_multiple_day/:schedule_type_id', ShiftScheduleController.delete_shift_schedule_multiple_day);


shiftscheduleRoutes.get('/get_shift_schedule_day', ShiftScheduleController.get_shift_schedule_day);
shiftscheduleRoutes.get('/get_shift_schedule_day_overtime', ShiftScheduleController.get_shift_schedule_day_overtime);



shiftscheduleRoutes.get('/get_shift_schedule_day_supervisor/:supervisor_emp_id', ShiftScheduleController.get_shift_schedule_day_supervisor);
shiftscheduleRoutes.get('/get_shift_schedule_day_overtime_supervisor/:supervisor_emp_id', ShiftScheduleController.get_shift_schedule_day_overtime_supervisor);



export default shiftscheduleRoutes;
