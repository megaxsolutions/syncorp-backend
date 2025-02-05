import { Router } from "express";
import * as EmployeeLevelController  from '../controllers/employee_level_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const employeeLevelRoutes = Router();


employeeLevelRoutes.post('/add_employee_level', EmployeeLevelController.create_employee_level);
employeeLevelRoutes.put('/update_employee_level/:e_level_id', EmployeeLevelController.update_employee_level);
employeeLevelRoutes.delete('/delete_employee_level/:e_level_id', EmployeeLevelController.delete_employee_level);




export default employeeLevelRoutes;
