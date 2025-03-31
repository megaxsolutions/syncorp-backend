import { Router } from "express";
import * as CoachingController  from '../../controllers/sync_db/coaching_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const coachingRoutes = Router();


coachingRoutes.post('/add_coaching', CoachingController.create_coaching);
coachingRoutes.put('/update_coaching/:coaching_id', CoachingController.update_coaching);
coachingRoutes.delete('/delete_coaching/:coaching_id', CoachingController.delete_coaching);
coachingRoutes.get('/get_all_user_coaching/:emp_id', CoachingController.get_all_user_coaching);
coachingRoutes.put('/update_coaching_acknowledgement/:emp_id/:coaching_id', CoachingController.update_coaching_acknowledgement);
coachingRoutes.get('/get_all_coaching', CoachingController.get_all_coaching);
coachingRoutes.get('/get_all_coaching_supervisor/:supervisor_emp_id', CoachingController.get_all_coaching_supervisor);


export default coachingRoutes;
