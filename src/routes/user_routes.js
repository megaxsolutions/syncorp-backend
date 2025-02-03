import { Router } from "express";
import * as UserController  from '../controllers/user_controller.js'; // Adjust the path as necessary

const userRoutes = Router();


userRoutes.post('/create', UserController.create_user);
userRoutes.post('/login_user', UserController.login_user);
userRoutes.get('/get_all_user', UserController.get_all_user);



export default userRoutes;
