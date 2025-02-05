import express from 'express';
import cors from 'cors';

import employeeRoutes from "./routes/employee_routes.js";
import mainRoutes from "./routes/main_routes.js";
import departmentRoutes from "./routes/department_routes.js";
import siteRoutes from "./routes/site_routes.js";
import clusterRoutes from "./routes/cluster_routes.js";
import positionRoutes from "./routes/position_routes.js";
import employeeLevelRoutes from "./routes/employee_level_routes.js";
import adminRoutes from "./routes/admin_routes.js";
import holidayRoutes from "./routes/holiday_routes.js";
import cutOffRoutes from "./routes/cutoff_routes.js";



import bodyParser from 'body-parser';
import dotenv from 'dotenv';


dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.text()); // Handles text/plain content type
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.use("/main", mainRoutes);
app.use("/admins", adminRoutes);
app.use("/employees", employeeRoutes);
app.use("/departments", departmentRoutes);
app.use("/sites", siteRoutes);
app.use("/clusters", clusterRoutes);
app.use("/positions", positionRoutes);
app.use("/employee_levels", employeeLevelRoutes);
app.use("/holidays", holidayRoutes);
app.use("/cutoffs", cutOffRoutes);



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});