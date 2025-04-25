import { Router } from "express";
import * as PhilHealthContributionController  from '../../controllers/sync_db/philh_contribution_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const philHealthContributionRoutes = Router();

philHealthContributionRoutes.get('/get_all_philh_contribution', PhilHealthContributionController.get_all_philh_contribution);
philHealthContributionRoutes.post('/add_philh_contribution', PhilHealthContributionController.create_philh_contribution);
philHealthContributionRoutes.put('/update_philh_contribution/:philh_contribution_id', PhilHealthContributionController.update_philh_contribution);
philHealthContributionRoutes.delete('/delete_philh_contribution/:philh_contribution_id', PhilHealthContributionController.delete_philh_contribution);


export default philHealthContributionRoutes;


