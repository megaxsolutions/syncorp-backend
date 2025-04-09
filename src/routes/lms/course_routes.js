import { Router } from "express";
import * as CourseController  from '../../controllers/lms/course_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const courseRoutes = Router();


courseRoutes.post('/add_course', CourseController.create_course);
courseRoutes.put('/update_course/:course_id', CourseController.update_course);
courseRoutes.get('/get_all_course', CourseController.get_all_course);
courseRoutes.delete('/delete_course/:course_id', CourseController.delete_course);





export default courseRoutes;
