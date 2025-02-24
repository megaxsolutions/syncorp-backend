import { Router } from "express";
import * as ShiftScheduleController  from '../controllers/shift_schedule_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const shiftscheduleRoutes = Router();


shiftscheduleRoutes.post('/add_shift_schedule_current_day', ShiftScheduleController.create_shift_schedule_current_day);
shiftscheduleRoutes.post('/add_shift_schedule_current_weekday', ShiftScheduleController.create_shift_schedule_current_weekday);
shiftscheduleRoutes.post('/add_shift_schedule_current_month_weekday', ShiftScheduleController.create_shift_schedule_current_month_weekday);


//shiftscheduleRoutes.put('/update_cluster/:cluster_id', ShiftScheduleController.update_cluster);
//shiftscheduleRoutes.delete('/delete_cluster/:cluster_id', ShiftScheduleController.delete_cluster);




export default shiftscheduleRoutes;
