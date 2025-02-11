import { Router } from "express";
import * as AdminController  from '../controllers/admin_controller.js'; // Adjust the path as necessary
import { authenticateToken } from "../middleware/auth.js";

const adminRoutes = Router();

//data
adminRoutes.post('/login_admin', AdminController.login_admin);

adminRoutes.put('/update_employee_login/:emp_id', authenticateToken, AdminController.update_admin_login);
adminRoutes.post('/add_admin', authenticateToken, AdminController.create_admin);
adminRoutes.get('/get_all_admin', authenticateToken, AdminController.get_all_admin);

adminRoutes.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ data: req.user });
});

// dminRoutes.get('/protected', authenticateToken, (req, res) => {
//     res.status(200).json({ message: 'This is a protected route', data: req.user });
// });

export default adminRoutes;
