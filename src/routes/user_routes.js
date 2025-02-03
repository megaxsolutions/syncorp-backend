import { Router } from "express";
import * as UserController  from '../controllers/user_controller.js'; // Adjust the path as necessary
import { authenticateToken } from '../middleware/auth.js'; // Adjust the path as necessary

const userRoutes = Router();


userRoutes.post('/create', UserController.create_user);
userRoutes.post('/login_user', UserController.login_user);
userRoutes.get('/get_all_user', UserController.get_all_user);

userRoutes.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', data: req.user });
});


export default userRoutes;
