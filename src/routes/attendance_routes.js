import { Router } from "express";
import * as AttendanceController  from '../controllers/attendance_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const attendanceRoutes = Router();


attendanceRoutes.post('/add_attendance', AttendanceController.create_attendance_time_in);
attendanceRoutes.put('/update_attendance/:attendance_id', AttendanceController.update_attendance_time_out);
attendanceRoutes.get('/get_all_attendance/:emp_id', AttendanceController.get_all_attendance);
attendanceRoutes.get('/get_user_latest_attendance/:emp_id', AttendanceController.get_user_latest_attendance);



export default attendanceRoutes;
