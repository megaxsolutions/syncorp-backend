import { Router } from "express";
import * as AdminController  from '../controllers/admin_controller.js'; // Adjust the path as necessary
import { authenticateToken } from "../middleware/auth.js";

const adminRoutes = Router();


adminRoutes.post('/add_admin', AdminController.create_admin);
adminRoutes.post('/login_admin', AdminController.login_admin);
adminRoutes.get('/get_all_admin', AdminController.get_all_admin);

adminRoutes.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', data: req.user });
});


export default adminRoutes;
