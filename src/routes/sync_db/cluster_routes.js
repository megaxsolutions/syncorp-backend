import { Router } from "express";
import * as ClusterController  from '../../controllers/sync_db/cluster_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const clusterRoutes = Router();


clusterRoutes.post('/add_cluster', ClusterController.create_cluster);
clusterRoutes.put('/update_cluster/:cluster_id', ClusterController.update_cluster);
clusterRoutes.delete('/delete_cluster/:cluster_id', ClusterController.delete_cluster);




export default clusterRoutes;
