import { Router } from "express";
import * as SignatureController  from '../../controllers/sync_db/signature_controller.js'; // Adjust the path as necessary

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
const uploadsDir = path.join(__dirname, '../../../uploads/signatures/');

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


const signatureRoutes = Router();


signatureRoutes.post('/add_signature', upload.single('file_uploaded'), SignatureController.create_signature);
signatureRoutes.put('/update_signature/:signature_id/:emp_id', upload.single('file_uploaded'), SignatureController.update_signature);
signatureRoutes.delete('/delete_signature/:signature_id', SignatureController.delete_signature);
signatureRoutes.get('/get_all_signature', SignatureController.get_all_signature);
signatureRoutes.get('/get_all_user_signature/:emp_id', SignatureController.get_all_user_signature);



export default signatureRoutes;
