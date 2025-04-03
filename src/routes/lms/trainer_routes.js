import { Router } from "express";
import * as TrainerController  from '../../controllers/lms/trainer_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const trainerRoutes = Router();


trainerRoutes.post('/add_trainer', TrainerController.create_trainer);
trainerRoutes.put('/update_trainer/:trainer_id', TrainerController.update_trainer);
trainerRoutes.get('/get_all_trainer', TrainerController.get_all_trainer);
trainerRoutes.delete('/delete_trainer/:trainer_id', TrainerController.delete_trainer);
trainerRoutes.get('/check_user_trainer/:emp_id/:category_id/:course_id', TrainerController.check_user_trainer);


export default trainerRoutes;
