import { Router } from "express";
import * as IncidentReportController  from '../../controllers/sync_db/incident_report_controller.js'; // Adjust the path as necessary

import { authenticateToken } from "../../middleware/auth.js";


const incidentReportRoutes = Router();


incidentReportRoutes.post('/add_incident_report', IncidentReportController.create_incident_report);
incidentReportRoutes.put('/update_incident_report/:incident_report_id', IncidentReportController.update_incident_report);
incidentReportRoutes.delete('/delete_incident_report/:incident_report_id', IncidentReportController.delete_incident_report);
incidentReportRoutes.get('/get_all_incident_report', IncidentReportController.get_all_incident_report);
incidentReportRoutes.get('/get_all_user_incident_report/:emp_id', IncidentReportController.get_all_user_incident_report);


export default incidentReportRoutes;
