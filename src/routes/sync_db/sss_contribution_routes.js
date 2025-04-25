import { Router } from "express";
import * as SSSContributionController  from '../../controllers/sync_db/sss_contribution_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const sssContributionRoutes = Router();

sssContributionRoutes.get('/get_all_sss_contribution', SSSContributionController.get_all_sss_contribution);
sssContributionRoutes.post('/add_sss_contribution', SSSContributionController.create_sss_contribution);
sssContributionRoutes.put('/update_sss_contribution/:sss_contribution_id', SSSContributionController.update_sss_contribution);
sssContributionRoutes.delete('/delete_sss_contribution/:sss_contribution_id', SSSContributionController.delete_sss_contribution);


export default sssContributionRoutes;


