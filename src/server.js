import express from 'express';
import cors from 'cors';

import { app, server, io, db } from './config/config.js'; // Import the database connection

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
import payslipRoutes from "./routes/payslip_routes.js";
import logRoutes from "./routes/log_routes.js";
import bonusRoutes from "./routes/bonus_routes.js";
import accountRoutes from "./routes/account_routes.js";
import breakscheduleRoutes from "./routes/break_schedule_routes.js";
import adjustmentRoutes from "./routes/adjusment_routes.js";
import eodRoutes from "./routes/eod_routes.js";






import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { authenticateToken } from "./middleware/auth.js";


import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname



dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;


// import { WebSocketServer } from 'ws'; // Use import syntax

// const wss = new WebSocketServer({ port: 8001 });


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
app.use("/coaching", authenticateToken, coachingRoutes);
app.use("/payslips", authenticateToken, payslipRoutes);
app.use("/logs", authenticateToken, logRoutes);
app.use("/bonus", authenticateToken, bonusRoutes);
app.use("/accounts", authenticateToken, accountRoutes);
app.use("/break_schedules", authenticateToken, breakscheduleRoutes);
app.use("/adjustments", authenticateToken, adjustmentRoutes);
app.use("/eod", authenticateToken, eodRoutes);








async function fetchLatestBulletins() {
  const sql  = 'SELECT * FROM bulletin ORDER BY id DESC LIMIT 50'; // Adjust the order by column as needed
  const [bulletins] = await db.query(sql);
  return bulletins;
}



io.on('connection', async (socket) => {
  console.log('A user connected');
  console.log('SOCKET ID: '+ socket.id);
  
  //io.emit('get_all_bulletins', await fetchLatestBulletins()); // Broadcast the latest bulletins to all clients


  socket.on('disconnect', () => {
      console.log('User  disconnected');
  });
});

// Handle connection events
// wss.on('connection', (ws) => {
//   console.log('Client connected');

//   ws.send(JSON.stringify(fetchLatestBulletins));

//   // Handle client disconnection
//   ws.on('close', () => {
//       console.log('Client disconnected');
//   });
// });


// io.on("connection", (socket) => {
//   const userId = computeUserId(socket);

//   socket.join(userId);

//   socket.on("disconnect", async () => {
//     const sockets = await io.in(userId).fetchSockets();
//     if (sockets.length === 0) {
//       // no more active connections for the given user
//     }
//   });
// });
// Handle WebSocket connections
// io.on('connection', async (socket) => {
//   console.log('A user connected');
//   console.log(socket.id);
  
//   io.emit('get_all_bulletins', await fetchLatestBulletins()); // Broadcast the latest bulletins to all clients

  // // Handle incoming messages from clients
  //socket.on('send_bulletins', async (msg) => {
   // io.emit('get_all_bulletins', await fetchLatestBulletins()); // Broadcast the latest bulletins to all clients
  //});

  // Handle disconnection
//   socket.on('disconnect', () => {
//       console.log('User  disconnected');
//   });
// });

// function sendNotification(userId, message) {
//   // Emit notification to a specific user
//   io.to(userId).emit('notification', { message });
// }

// Example function to trigger notifications
// function notifyUsers() {
//   const query = 'SELECT socket_id FROM users WHERE condition = true'; // Adjust condition as needed
//   db.query(query, (err, results) => {
//       if (err) throw err;
//       results.forEach(user => {
//           sendNotification(user.socket_id, 'You have a new message!');
//       });
//   });
// }


// setInterval(async () => {
//   io.emit('get_all_bulletins', await fetchLatestBulletins()); // Broadcast the latest bulletins to all clients
// }, 1000); // Adjust the interval as needed


server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


