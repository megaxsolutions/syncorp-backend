import { Router } from "express";
import * as SSSLoanController  from '../../controllers/sync_db/sss_loan_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const sssLoanRoutes = Router();

sssLoanRoutes.get('/get_all_sss_loan', SSSLoanController.get_all_sss_loan);
sssLoanRoutes.post('/add_sss_loan', SSSLoanController.create_sss_loan);
sssLoanRoutes.put('/update_sss_loan/:sss_loan_id', SSSLoanController.update_sss_loan);
sssLoanRoutes.delete('/delete_sss_loan/:sss_loan_id', SSSLoanController.delete_sss_loan);


export default sssLoanRoutes;
