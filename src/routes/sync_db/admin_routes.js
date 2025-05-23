import { Router } from "express";
import * as AdminController  from '../../controllers/sync_db/admin_controller.js'; // Adjust the path as necessary
import { authenticateToken } from "../../middleware/auth.js";
import { authenticateTokenSecondary } from "../../middleware/auth_secondary.js";

import multer from 'multer';
import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname


// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the uploads directory relative to the current file
const uploadsDir = path.join(__dirname, '../../../uploads/users/');

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


const adminRoutes = Router();


adminRoutes.post('/login_admin', AdminController.login_admin);


adminRoutes.put('/update_admin_expiration/:emp_id', authenticateToken, AdminController.update_admin_expiration);
adminRoutes.put('/update_admin_login/:emp_id', authenticateToken, AdminController.update_admin_login);
adminRoutes.put('/update_admin_login_attempts/:emp_id', authenticateToken, AdminController.update_admin_login_attempts);

adminRoutes.put('/update_admin_login_site_id/:emp_id', authenticateToken, AdminController.update_admin_login_site_id);



adminRoutes.put('/update_admin/:emp_id', authenticateToken, upload.single('file_uploaded'), AdminController.update_admin);
adminRoutes.post('/add_admin', authenticateToken, AdminController.create_admin);
adminRoutes.get('/get_all_admin', authenticateToken, AdminController.get_all_admin);
adminRoutes.get('/get_admin/:emp_id', authenticateToken, AdminController.get_admin);
adminRoutes.delete('/delete_admin/:admin_emp_id', authenticateToken, AdminController.delete_admin);

adminRoutes.get('/remove_user_level_admin/:emp_id/:user_level', authenticateToken, AdminController.remove_user_level_admin);
adminRoutes.get('/remove_cluster_supervisor/:emp_id/:cluster_id', AdminController.remove_cluster_supervisor);

adminRoutes.post('/update_admin_user_level', authenticateToken, AdminController.update_admin_user_level);
adminRoutes.post('/update_admin_user_level_supervisor_cluster', authenticateToken, AdminController.update_admin_user_level_supervisor_cluster);





adminRoutes.get('/protected', authenticateTokenSecondary, (req, res) => {
    res.status(200).json({ data: req.user });
});

export default adminRoutes;
