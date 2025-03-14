import { Router } from "express";
import * as UserController  from '../controllers/employee_controller.js'; // Adjust the path as necessary
import * as MainController  from '../controllers/main_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";

import multer from 'multer';
import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname


// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the uploads directory relative to the current file
const uploadsDir = path.join(__dirname, '../../uploads/users/');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Use the dynamically created uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
    }
});


const upload = multer({ storage: storage });

const employeeRoutes = Router();

employeeRoutes.post('/login_employee', UserController.login_employee);


employeeRoutes.put('/update_employee_expiration/:emp_id', authenticateToken, UserController.update_employee_expiration);
employeeRoutes.put('/update_employee/:emp_id', authenticateToken,  upload.single('file_uploaded'), UserController.update_employee);
employeeRoutes.post('/add_employee', upload.single('file_uploaded'), authenticateToken, UserController.create_employee);
employeeRoutes.put('/update_employee_login_attempts/:emp_id', authenticateToken, UserController.update_employee_login_attempts);
employeeRoutes.get('/get_all_employee', authenticateToken, UserController.get_all_employee);
employeeRoutes.get('/get_all_employee_supervisor/:supervisor_emp_id', authenticateToken, UserController.get_all_employee_supervisor);
employeeRoutes.put('/update_employee_login/:emp_id', authenticateToken, UserController.update_employee_login);



employeeRoutes.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ data: req.user });
});



export default employeeRoutes;
