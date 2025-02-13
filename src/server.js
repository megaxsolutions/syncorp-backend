import express from 'express';
import cors from 'cors';

import db from './config/config.js'; // Import the database connection


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
import attendanceRoutes from "./routes/attendance_routes.js";
import dtrRoutes from "./routes/dtr_routes.js";
import recoveryRoutes from "./routes/recovery_routes.js";
import adminLevelRoutes from "./routes/admin_level_routes.js";
import breakRoutes from "./routes/break_routes.js";
import leaveRequestRoutes from "./routes/leave_request_routes.js";
import leaveTypeRoutes from "./routes/leave_type_routes.js";
import overtimeTypeRoutes from "./routes/overtime_type_routes.js";


import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { authenticateToken } from "./middleware/auth.js";
//j

import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname


// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.text()); 
app.use(express.urlencoded({ extended: true }));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/admins", adminRoutes);
app.use("/employees", employeeRoutes);
app.use("/recovery", recoveryRoutes);

app.use("/main", authenticateToken, mainRoutes);
app.use("/departments", authenticateToken, departmentRoutes);
app.use("/sites", authenticateToken, siteRoutes);
app.use("/clusters", authenticateToken, clusterRoutes);
app.use("/positions", authenticateToken, positionRoutes);
app.use("/employee_levels", authenticateToken, employeeLevelRoutes);
app.use("/admin_levels", authenticateToken, adminLevelRoutes);
app.use("/holidays", authenticateToken, holidayRoutes);
app.use("/cutoffs", authenticateToken, cutOffRoutes);
app.use("/attendances", authenticateToken, attendanceRoutes);
app.use("/dtr", authenticateToken, dtrRoutes);
app.use("/breaks", authenticateToken, breakRoutes);
app.use("/leave_requests", authenticateToken, leaveRequestRoutes);
app.use("/leave_types", authenticateToken, leaveTypeRoutes);
app.use("/overtime_types", authenticateToken, overtimeTypeRoutes);



db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
