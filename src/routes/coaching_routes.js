import { Router } from "express";
import * as CoachingController  from '../controllers/coaching_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const coachingRoutes = Router();


coachingRoutes.post('/add_coaching', CoachingController.create_coaching);
coachingRoutes.put('/update_coaching/:coaching_id', CoachingController.update_coaching);
coachingRoutes.delete('/delete_coaching/:coaching_id', CoachingController.delete_coaching);
coachingRoutes.get('/get_all_coaching', CoachingController.get_all_coaching);


export default coachingRoutes;
