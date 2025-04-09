import { Router } from "express";
import * as BulletinController  from '../../controllers/sync_db/bulletin_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


import multer from 'multer';
import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname


// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the uploads directory relative to the current file
const uploadsDir = path.join(__dirname, '../../../uploads/bulletins/');

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


const bulletinRoutes = Router();


bulletinRoutes.post('/add_bulletin', upload.single('file_uploaded'), BulletinController.create_bulletin);
bulletinRoutes.put('/update_bulletin/:bulletin_id/:emp_id', upload.single('file_uploaded'), BulletinController.update_bulletin);
bulletinRoutes.delete('/delete_bulletin/:bulletin_id', BulletinController.delete_bulletin);
bulletinRoutes.get('/get_all_bulletin', BulletinController.get_all_bulletin);



export default bulletinRoutes;
