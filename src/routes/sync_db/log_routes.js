import { Router } from "express";
import * as LogController  from '../../controllers/sync_db/log_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";

const logRoutes = Router();

logRoutes.get('/get_all_user_log/:emp_id', LogController.get_all_user_log);
logRoutes.put('/read_user_specific_log/:emp_id/:log_id', LogController.read_user_specific_log);
logRoutes.put('/read_user_all_log/:emp_id', LogController.read_user_all_log);

export default logRoutes;
