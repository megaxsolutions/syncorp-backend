import { Router } from "express";
import * as BonusController  from '../../controllers/sync_db/bonus_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const bonusRoutes = Router();


bonusRoutes.post('/add_bonus', BonusController.create_bonus);
bonusRoutes.put('/update_bonus/:bonus_id', BonusController.update_bonus);
bonusRoutes.get('/get_all_bonus', BonusController.get_all_bonus);
bonusRoutes.get('/get_all_bonus_supervisor/:supervisor_emp_id', BonusController.get_all_bonus_supervisor);
bonusRoutes.delete('/delete_bonus/:bonus_id', BonusController.delete_bonus);
//bonusRoutes.put('/update_approval_bonus/:bonus_id', BonusController.update_approval_bonus);
bonusRoutes.put('/update_approval_bonus_admin/:bonus_id', BonusController.update_approval_bonus_admin);





export default bonusRoutes;
