import { Router } from "express";
import * as UserController  from '../../controllers/lms/user_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const userRoutes = Router();


userRoutes.post('/add_user', UserController.create_user);
userRoutes.get('/get_all_user', UserController.get_all_user);
userRoutes.get('/check_user/:emp_id', UserController.check_user);
userRoutes.delete('/delete_user/:user_id', UserController.delete_user);
//userRoutes.delete('/delete_multiple_user', UserController.delete_multiple_user);



export default userRoutes;
