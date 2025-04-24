import { Router } from "express";
import * as CutoffController  from '../../controllers/sync_db/cutoff_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const cutOffRoutes = Router();


cutOffRoutes.get('/get_latest_cutoff', CutoffController.get_latest_cutoff);
cutOffRoutes.post('/add_cutoff', authenticateToken, CutoffController.create_cutoff);
cutOffRoutes.put('/update_cutoff/:cutoff_id', authenticateToken, CutoffController.update_cutoff);
cutOffRoutes.delete('/delete_cutoff/:cutoff_id', authenticateToken, CutoffController.delete_cutoff);




export default cutOffRoutes;
