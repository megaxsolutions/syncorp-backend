import { Router } from "express";
import * as AccountController  from '../../controllers/sync_db/account_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const accountRoutes = Router();

accountRoutes.get('/get_all_account', AccountController.get_all_account);
accountRoutes.post('/add_account', AccountController.create_account);
accountRoutes.put('/update_account/:account_id', AccountController.update_account);
accountRoutes.delete('/delete_account/:account_id', AccountController.delete_account);


export default accountRoutes;
