import { Router } from "express";
import * as DepartmentController  from '../controllers/department_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const departmentRoutes = Router();


departmentRoutes.post('/add_department', DepartmentController.create_department);
departmentRoutes.put('/update_department/:department_id', DepartmentController.update_department);
departmentRoutes.delete('/delete_department/:department_id', DepartmentController.delete_department);




export default departmentRoutes;
