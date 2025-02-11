import { Router } from "express";
import * as BreakController  from '../controllers/break_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const breakRoutes = Router();


breakRoutes.post('/add_break', BreakController.create_break);
breakRoutes.put('/update_break/:break_id', BreakController.update_break_break_out);
breakRoutes.get('/get_all_break', BreakController.get_all_break);


export default breakRoutes;
