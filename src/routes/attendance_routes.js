import { Router } from "express";
import * as AttendanceController  from '../controllers/attendance_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const attendanceRoutes = Router();


attendanceRoutes.post('/add_attendance', AttendanceController.create_attendance_time_in);
attendanceRoutes.put('/update_attendance/:attendance_id', AttendanceController.update_attendance_time_out);


export default attendanceRoutes;
