import { Router } from "express";
import * as CoachingTypeController  from '../controllers/coaching_type_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const coachingTypeRoutes = Router();


coachingTypeRoutes.post('/add_coaching_type', CoachingTypeController.create_coaching_type);
coachingTypeRoutes.put('/update_coaching_type/:coaching_type_id', CoachingTypeController.update_coaching_type);
coachingTypeRoutes.delete('/delete_coaching_type/:coaching_type_id', CoachingTypeController.delete_coaching_type);
coachingTypeRoutes.get('/get_all_coaching_type', CoachingTypeController.get_all_coaching_type);


export default coachingTypeRoutes;
