import { Router } from "express";
import * as QuestionController  from '../../controllers/lms/question_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const questionRoutes = Router();


questionRoutes.post('/add_question', QuestionController.create_question);
questionRoutes.put('/update_question/:question_id', QuestionController.update_question);
questionRoutes.get('/get_all_question', QuestionController.get_all_question);
questionRoutes.get('/get_specific_question/:question_id', QuestionController.get_specific_question);
questionRoutes.delete('/delete_question/:question_id', QuestionController.delete_question);


export default questionRoutes;
