import { Router } from "express";
import * as PagibigContributionController  from '../../controllers/sync_db/pagibig_contribution_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const pagibigContributionRoutes = Router();

pagibigContributionRoutes.get('/get_all_pagibig_contribution', PagibigContributionController.get_all_pagibig_contribution);
pagibigContributionRoutes.post('/add_pagibig_contribution', PagibigContributionController.create_pagibig_contribution);
pagibigContributionRoutes.put('/update_pagibig_contribution/:pagibig_contribution_id', PagibigContributionController.update_pagibig_contribution);
pagibigContributionRoutes.delete('/delete_pagibig_contribution/:pagibig_contribution_id', PagibigContributionController.delete_pagibig_contribution);


export default pagibigContributionRoutes;
