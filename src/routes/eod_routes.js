import { Router } from "express";
import * as EODController  from '../controllers/eod_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const eodRoutes = Router();


eodRoutes.post('/add_eod', EODController.create_eod);
eodRoutes.put('/update_eod/:eod_id', EODController.update_eod);
eodRoutes.get('/get_all_eod', EODController.get_all_eod);
eodRoutes.get('/get_all_user_eod/:emp_id', EODController.get_all_user_eod);
eodRoutes.delete('/delete_eod/:eod_id', EODController.delete_eod);
eodRoutes.get('/get_all_eod_supervisor/:supervisor_emp_id', EODController.get_all_eod_supervisor);




export default eodRoutes;
