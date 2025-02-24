import { Router } from "express";
import * as MainController  from '../controllers/main_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const mainRoutes = Router();

mainRoutes.get('/get_all_dropdown_data', MainController.get_all_dropdown_data);
mainRoutes.get('/test_result', MainController.test_result);
mainRoutes.post('/test_create_break', MainController.test_create_break);



export default mainRoutes;
