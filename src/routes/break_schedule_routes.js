import { Router } from "express";
import * as BreakScheduleController  from '../controllers/break_schedule_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const breakscheduleRoutes = Router();


breakscheduleRoutes.post('/add_break_shift_schedule_multiple_day', BreakScheduleController.create_break_shift_schedule_multiple_day);
breakscheduleRoutes.delete('/delete_break_shift_schedule_multiple_day/:schedule_type_id', BreakScheduleController.delete_break_shift_schedule_multiple_day);
breakscheduleRoutes.get('/get_break_shift_schedule_day', BreakScheduleController.get_break_shift_schedule_day);
breakscheduleRoutes.get('/get_break_shift_schedule_day_supervisor/:supervisor_emp_id', BreakScheduleController.get_break_shift_schedule_day_supervisor);



export default breakscheduleRoutes;
