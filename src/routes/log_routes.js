import { Router } from "express";
import * as LogController  from '../controllers/log_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";

const logRoutes = Router();

logRoutes.get('/get_all_user_log/:emp_id', LogController.get_all_user_log);

 
export default logRoutes;
