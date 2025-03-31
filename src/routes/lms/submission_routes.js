import { Router } from "express";
import * as SubmissionController  from '../../controllers/lms/submission_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const submissionRoutes = Router();


submissionRoutes.post('/add_submission', SubmissionController.create_submission);
submissionRoutes.put('/update_submission/:submission_id', SubmissionController.update_submission);
submissionRoutes.get('/get_all_submission', SubmissionController.get_all_submission);
submissionRoutes.delete('/delete_submission/:submission_id', SubmissionController.delete_submission);



export default submissionRoutes;
