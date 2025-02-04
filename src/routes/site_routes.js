import { Router } from "express";
import * as SiteController  from '../controllers/site_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../middleware/auth.js";


const siteRoutes = Router();


siteRoutes.post('/add_site', SiteController.create_site);
siteRoutes.put('/update_site/:site_id', SiteController.update_site);
siteRoutes.delete('/delete_site/:site_id', SiteController.delete_site);




export default siteRoutes;
