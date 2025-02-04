import { Router } from "express";
import * as PositionController  from '../controllers/position_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";

const positionRoutes = Router();

positionRoutes.post('/create', PositionController.create_position);
positionRoutes.put('/update_position/:position_id', PositionController.update_position);
positionRoutes.delete('/delete_position/:position_id', PositionController.delete_position);


export default positionRoutes;
