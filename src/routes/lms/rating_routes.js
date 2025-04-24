import { Router } from "express";
import * as RatingController  from '../../controllers/lms/rating_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const ratingRoutes = Router();

ratingRoutes.post('/add_rating', RatingController.create_rating);
ratingRoutes.put('/update_rating/:rating_id', RatingController.update_rating);
ratingRoutes.delete('/delete_rating/:rating_id', RatingController.delete_rating);


export default ratingRoutes;
