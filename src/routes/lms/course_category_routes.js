import { Router } from "express";
import * as CourseCategoryController  from '../../controllers/lms/course_category_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const courseCategoryRoutes = Router();


courseCategoryRoutes.post('/add_course_category', CourseCategoryController.create_course_category);
courseCategoryRoutes.put('/update_course_category/:course_category_id', CourseCategoryController.update_course_category);
courseCategoryRoutes.get('/get_all_course_category', CourseCategoryController.get_all_course_category);
courseCategoryRoutes.delete('/delete_course_category/:course_category_id', CourseCategoryController.delete_course_category);




export default courseCategoryRoutes;
