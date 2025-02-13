import { Router } from "express";
import * as LeaveRequestController  from '../controllers/leave_request_controller.js'; // Adjust the path as necessary
import multer from 'multer';
import { authenticateToken } from "../middleware/auth.js";

import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname


// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the uploads directory relative to the current file
const uploadsDir = path.join(__dirname, '../../uploads/leave_requests/');

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


const leaveRequestRoutes = Router();


leaveRequestRoutes.post('/add_leave_request', upload.single('file_uploaded'), LeaveRequestController.create_leave_request);
leaveRequestRoutes.put('/update_user_leave_request/:leave_request_id',  upload.single('file_uploaded'), LeaveRequestController.update_user_leave_request);
leaveRequestRoutes.put('/update_approval_leave_request/:leave_request_id', LeaveRequestController.update_approval_leave_request);
leaveRequestRoutes.get('/get_all_leave_request', LeaveRequestController.get_all_leave_request);
leaveRequestRoutes.delete('/delete_leave_request/:leave_request_id', LeaveRequestController.delete_leave_request);


export default leaveRequestRoutes;
