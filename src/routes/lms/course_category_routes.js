import { Router } from "express";
import * as CourseCategoryController  from '../../controllers/lms/course_category_controller.js'; // Adjust the path as necessary

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
const uploadsDir = path.join(__dirname, '../../../uploads/course_category/');

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


const courseCategoryRoutes = Router();


courseCategoryRoutes.post('/add_course_category', upload.single('file_uploaded'), CourseCategoryController.create_course_category);
courseCategoryRoutes.put('/update_course_category/:course_category_id', upload.single('file_uploaded'), CourseCategoryController.update_course_category);
courseCategoryRoutes.get('/get_all_course_category', CourseCategoryController.get_all_course_category);
courseCategoryRoutes.delete('/delete_course_category/:course_category_id', CourseCategoryController.delete_course_category);




export default courseCategoryRoutes;
