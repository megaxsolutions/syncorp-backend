import { Router } from "express";
import * as TrainerController  from '../../controllers/lms/trainer_controller.js'; // Adjust the path as necessary

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
const uploadsDir = path.join(__dirname, '../../../uploads/trainers/');

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


const trainerRoutes = Router();


trainerRoutes.post('/add_trainer', upload.single('file_uploaded'), TrainerController.create_trainer);
trainerRoutes.put('/update_trainer/:trainer_id', upload.single('file_uploaded'), TrainerController.update_trainer);
trainerRoutes.get('/get_all_trainer', TrainerController.get_all_trainer);
trainerRoutes.get('/get_all_user_trainer/:emp_id', TrainerController.get_all_user_trainer);
trainerRoutes.delete('/delete_trainer/:trainer_id', TrainerController.delete_trainer);
trainerRoutes.get('/check_user_trainer/:emp_id/:category_id/:course_id', TrainerController.check_user_trainer);


export default trainerRoutes;
