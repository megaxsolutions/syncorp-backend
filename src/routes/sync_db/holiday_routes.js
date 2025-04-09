import { Router } from "express";
import * as HolidayController  from '../../controllers/sync_db/holiday_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const holidayRoutes = Router();


holidayRoutes.post('/add_holiday', HolidayController.create_holiday);
holidayRoutes.put('/update_holiday/:holiday_id', HolidayController.update_holiday);
holidayRoutes.delete('/delete_holiday/:holiday_id', HolidayController.delete_holiday);
holidayRoutes.get('/get_all_holiday', HolidayController.get_all_holiday);



export default holidayRoutes;
