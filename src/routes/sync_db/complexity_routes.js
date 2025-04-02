import { Router } from "express";
import * as ComplexityController  from '../../controllers/sync_db/complexity_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const complexityRoutes = Router();


complexityRoutes.post('/add_complexity', ComplexityController.create_complexity);
complexityRoutes.put('/update_complexity/:complexity_id', ComplexityController.update_complexity);
complexityRoutes.get('/get_all_complexity', ComplexityController.get_all_complexity);
complexityRoutes.delete('/delete_complexity/:complexity_id', ComplexityController.delete_complexity);
complexityRoutes.put('/update_approval_complexity_admin/:complexity_id', ComplexityController.update_approval_complexity_admin);

export default complexityRoutes;
