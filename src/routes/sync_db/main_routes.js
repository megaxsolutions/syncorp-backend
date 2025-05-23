import { Router } from "express";
import * as MainController  from '../../controllers/sync_db/main_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const mainRoutes = Router();

mainRoutes.get('/get_all_dropdown_data', MainController.get_all_dropdown_data);


export default mainRoutes;
