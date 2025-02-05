import { Router } from "express";
import * as UserController  from '../controllers/employee_controller.js'; // Adjust the path as necessary
import * as MainController  from '../controllers/main_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";



const employeeRoutes = Router();


employeeRoutes.post('/add_employee', UserController.create_employee);
employeeRoutes.post('/login_employee', UserController.login_employee);
employeeRoutes.get('/get_all_employee', UserController.get_all_employee);

employeeRoutes.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', data: req.user });
});


export default employeeRoutes;
