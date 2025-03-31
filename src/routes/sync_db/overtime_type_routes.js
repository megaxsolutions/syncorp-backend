import { Router } from "express";
import * as OvertimeTypeController  from '../../controllers/sync_db/overtime_type_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const overtimeTypeRoutes = Router();


overtimeTypeRoutes.post('/add_overtime_type', OvertimeTypeController.create_overtime_type);
overtimeTypeRoutes.put('/update_overtime_type/:overtime_type_id', OvertimeTypeController.update_overtime_type);
overtimeTypeRoutes.delete('/delete_overtime_type/:overtime_type_id', OvertimeTypeController.delete_overtime_type);
overtimeTypeRoutes.get('/get_all_overtime_type', OvertimeTypeController.get_all_overtime_type);




export default overtimeTypeRoutes;
