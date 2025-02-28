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
import overtimeRequestRoutes from "./routes/overtime_request_routes.js";
import bulletinRoutes from "./routes/bulletin_routes.js";
import shiftscheduleRoutes from "./routes/shift_schedule_routes.js";
import coachingTypeRoutes from "./routes/coaching_type_routes.js";
import coachingRoutes from "./routes/coaching_routes.js";



import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { authenticateToken } from "./middleware/auth.js";
//j

import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname


import { Server } from 'socket.io';
import { createServer } from 'node:http';

dotenv.config();


const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Adjust this to your React app's URL
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

  

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
app.use("/overtime_requests", authenticateToken, overtimeRequestRoutes);
app.use("/bulletins", authenticateToken, bulletinRoutes);
app.use("/shift_schedules", authenticateToken, shiftscheduleRoutes);
app.use("/coaching_types", authenticateToken, coachingTypeRoutes);
app.use("/coaching_types", authenticateToken, coachingRoutes);



// db.connect(err => {
//     if (err) {
//         console.error('Database connection failed:', err);
//         return;
//     }
//     console.log('Connected to MySQL database.');
// });


async function fetchLatestBulletins() {
  const sql = 'SELECT * FROM bulletin ORDER BY id DESC LIMIT 50'; // Adjust the order by column as needed
  const [bulletins] = await db.query(sql);
  return bulletins;
}

// Handle WebSocket connections
io.on('connection', async (socket) => {
  console.log('A user connected');

  io.emit('get_all_bulletins', await fetchLatestBulletins()); // Broadcast the latest bulletins to all clients

  // Handle incoming messages from clients
  socket.on('refresh_all_bulletins', async (msg) => {
    io.emit('get_all_bulletins', await fetchLatestBulletins()); // Broadcast the latest bulletins to all clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log('User  disconnected');
  });
});


server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
