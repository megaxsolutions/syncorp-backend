import { Router } from "express";
import * as DTRController  from '../../controllers/sync_db/dtr_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";

const dtrRoutes = Router();

dtrRoutes.get('/get_all_dtr', DTRController.get_all_dtr);
dtrRoutes.get('/get_all_user_dtr/:emp_id/:cutoff_id', DTRController.get_all_user_dtr);
dtrRoutes.get('/get_all_user_dtr_admin/:cutoff_id', DTRController.get_all_user_dtr_admin);


export default dtrRoutes;
