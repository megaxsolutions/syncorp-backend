import { Router } from "express";
import * as ShiftScheduleController  from '../controllers/shift_schedule_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const shiftscheduleRoutes = Router();


shiftscheduleRoutes.post('/add_shift_schedule_multiple_day_overtime', ShiftScheduleController.create_shift_schedule_multiple_day_overtime);
shiftscheduleRoutes.post('/add_shift_schedule_multiple_day', ShiftScheduleController.create_shift_schedule_multiple_day);
shiftscheduleRoutes.post('/add_shift_schedule_weekday', ShiftScheduleController.create_shift_schedule_weekday);
shiftscheduleRoutes.post('/add_shift_schedule_month_weekday', ShiftScheduleController.create_shift_schedule_month_weekday);
shiftscheduleRoutes.delete('/delete_shift_schedule_multiple_day', ShiftScheduleController.delete_shift_schedule_multiple_day);
shiftscheduleRoutes.delete('/delete_shift_schedule_weekday', ShiftScheduleController.delete_shift_schedule_weekday);
shiftscheduleRoutes.delete('/delete_shift_schedule_month_weekday', ShiftScheduleController.delete_shift_schedule_month_weekday);


export default shiftscheduleRoutes;
