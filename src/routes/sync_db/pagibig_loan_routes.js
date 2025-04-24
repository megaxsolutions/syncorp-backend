import { Router } from "express";
import * as PagibigLoanController  from '../../controllers/sync_db/pagibig_loan_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const pagibigLoanRoutes = Router();

pagibigLoanRoutes.get('/get_all_pagibig_loan', PagibigLoanController.get_all_pagibig_loan);
pagibigLoanRoutes.post('/add_pagibig_loan', PagibigLoanController.create_pagibig_loan);
pagibigLoanRoutes.put('/update_pagibig_loan/:pagibig_loan_id', PagibigLoanController.update_pagibig_loan);
pagibigLoanRoutes.delete('/delete_pagibig_loan/:pagibig_loan_id', PagibigLoanController.delete_pagibig_loan);


export default pagibigLoanRoutes;
