import { Router } from "express";
import * as CourseController  from '../../controllers/lms/course_controller.js'; // Adjust the path as necessary

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
const uploadsDir = path.join(__dirname, '../../../uploads/courses/');

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


const courseRoutes = Router();


courseRoutes.post('/add_course', upload.single('file_uploaded'), CourseController.create_course);
courseRoutes.put('/update_course/:course_id', upload.single('file_uploaded'), CourseController.update_course);
courseRoutes.get('/get_all_course', CourseController.get_all_course);
courseRoutes.get('/get_specific_course/:course_id', CourseController.get_specific_course);
courseRoutes.delete('/delete_course/:course_id', CourseController.delete_course);





export default courseRoutes;
