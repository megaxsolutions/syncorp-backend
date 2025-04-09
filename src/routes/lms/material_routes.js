import { Router } from "express";
import * as MaterialController  from '../../controllers/lms/material_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const materialRoutes = Router();


materialRoutes.post('/add_material', MaterialController.create_material);
materialRoutes.put('/update_material/:material_id', MaterialController.update_material);
materialRoutes.get('/get_all_material', MaterialController.get_all_material);
materialRoutes.delete('/delete_material/:material_id', MaterialController.delete_material);


export default materialRoutes;
