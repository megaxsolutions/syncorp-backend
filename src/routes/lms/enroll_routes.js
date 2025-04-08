import { Router } from "express";
import * as EnrollController  from '../../controllers/lms/enroll_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const enrollRoutes = Router();


enrollRoutes.post('/add_enroll', EnrollController.create_enroll);
enrollRoutes.put('/update_enroll/:enroll_id', EnrollController.update_enroll);
enrollRoutes.get('/get_all_enroll', EnrollController.get_all_enroll);
enrollRoutes.get('/get_all_user_enroll/:emp_id', EnrollController.get_all_user_enroll);
enrollRoutes.delete('/delete_enroll/:enroll_id', EnrollController.delete_enroll);
enrollRoutes.get('/check_user_enroll/:emp_id/:category_id/:course_id', EnrollController.check_user_enroll);


export default enrollRoutes;
