import { Router } from "express";
import * as BreakController  from '../../controllers/sync_db/break_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const breakRoutes = Router();


breakRoutes.post('/add_break', BreakController.create_break);
breakRoutes.put('/update_break/:emp_id', BreakController.update_break_break_out);
breakRoutes.get('/get_all_break', BreakController.get_all_break);
breakRoutes.get('/get_all_user_break/:emp_id', BreakController.get_all_user_break);



export default breakRoutes;
