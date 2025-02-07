import { Router } from "express";
import * as HolidayController  from '../controllers/holiday_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const holidayRoutes = Router();


holidayRoutes.post('/add_holiday', HolidayController.create_holiday);
holidayRoutes.put('/update_holiday/:holiday_id', HolidayController.update_holiday);
holidayRoutes.delete('/delete_holiday/:holiday_id', HolidayController.delete_holiday);




export default holidayRoutes;
