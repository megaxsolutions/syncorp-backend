import { Router } from "express";
import * as UserController  from '../controllers/employee_controller.js'; // Adjust the path as necessary
import * as MainController  from '../controllers/main_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";



const employeeRoutes = Router();

employeeRoutes.post('/login_employee', UserController.login_employee);

employeeRoutes.put('/update_employee_login/:emp_id', authenticateToken, UserController.update_employee_login);
employeeRoutes.put('/update_employee/:emp_id', authenticateToken, UserController.update_employee);
employeeRoutes.post('/add_employee', authenticateToken, UserController.create_employee);
employeeRoutes.get('/get_all_employee', authenticateToken, UserController.get_all_employee);



employeeRoutes.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ data: req.user });
});


// employeeRoutes.get('/protected', authenticateToken, (req, res) => {
//     res.status(200).json({ message: 'This is a protected route', data: req.user });
// });

export default employeeRoutes;
