import { Router } from "express";
import * as MoodMeterController  from '../../controllers/sync_db/moodmeter_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";

const moodMeterRoutes = Router();

moodMeterRoutes.get('/check_mood_meter/:emp_id', MoodMeterController.check_moodmeter);
moodMeterRoutes.get('/get_all_mood_meter', MoodMeterController.get_all_moodmeter);
moodMeterRoutes.get('/get_all_user_mood_meter/:emp_id', MoodMeterController.get_all_user_moodmeter);
moodMeterRoutes.post('/add_mood_meter', MoodMeterController.create_moodmeter);


export default moodMeterRoutes;
