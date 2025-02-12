import { Router } from "express";
import * as AdminLevelController  from '../controllers/admin_level_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const adminLevelRoutes = Router();


adminLevelRoutes.post('/add_admin_level', AdminLevelController.create_admin_level);
adminLevelRoutes.put('/update_admin_level/:admin_level_id', AdminLevelController.update_admin_level);
adminLevelRoutes.delete('/delete_admin_level/:admin_level_id', AdminLevelController.delete_admin_level);




export default adminLevelRoutes;
