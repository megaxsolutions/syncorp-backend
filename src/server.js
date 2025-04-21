import express from 'express';
import cors from 'cors';

import { app, server, io, db } from './config/config.js'; // Import the database connection

import employeeRoutes from "./routes/sync_db/employee_routes.js";
import mainRoutes from "./routes/sync_db/main_routes.js";
import departmentRoutes from "./routes/sync_db/department_routes.js";
import siteRoutes from "./routes/sync_db/site_routes.js";
import clusterRoutes from "./routes/sync_db/cluster_routes.js";
import positionRoutes from "./routes/sync_db/position_routes.js";
import employeeLevelRoutes from "./routes/sync_db/employee_level_routes.js";
import adminRoutes from "./routes/sync_db/admin_routes.js";
import holidayRoutes from "./routes/sync_db/holiday_routes.js";
import cutOffRoutes from "./routes/sync_db/cutoff_routes.js";
import attendanceRoutes from "./routes/sync_db/attendance_routes.js";
import dtrRoutes from "./routes/sync_db/dtr_routes.js";
import recoveryRoutes from "./routes/sync_db/recovery_routes.js";
import adminLevelRoutes from "./routes/sync_db/admin_level_routes.js";
import breakRoutes from "./routes/sync_db/break_routes.js";
import leaveRequestRoutes from "./routes/sync_db/leave_request_routes.js";
import leaveTypeRoutes from "./routes/sync_db/leave_type_routes.js";
import overtimeTypeRoutes from "./routes/sync_db/overtime_type_routes.js";
import overtimeRequestRoutes from "./routes/sync_db/overtime_request_routes.js";
import bulletinRoutes from "./routes/sync_db/bulletin_routes.js";
import shiftscheduleRoutes from "./routes/sync_db/shift_schedule_routes.js";
import coachingTypeRoutes from "./routes/sync_db/coaching_type_routes.js";
import coachingRoutes from "./routes/sync_db/coaching_routes.js";
import payslipRoutes from "./routes/sync_db/payslip_routes.js";
import logRoutes from "./routes/sync_db/log_routes.js";
import bonusRoutes from "./routes/sync_db/bonus_routes.js";
import accountRoutes from "./routes/sync_db/account_routes.js";
import breakscheduleRoutes from "./routes/sync_db/break_schedule_routes.js";
import adjustmentRoutes from "./routes/sync_db/adjusment_routes.js";
import eodRoutes from "./routes/sync_db/eod_routes.js";
import payrollRoutes from "./routes/sync_db/payroll_routes.js";
import complexityRoutes from "./routes/sync_db/complexity_routes.js";
import attendanceIncentivesRoutes from "./routes/sync_db/att_incentives_routes.js";
import signatureRoutes from "./routes/sync_db/signature_routes.js";
import moodMeterRoutes from "./routes/sync_db/mood_meter_routes.js";
import incidentReportRoutes from "./routes/sync_db/incident_report_routes.js";
import eligibleAttendanceIncentive from "./routes/sync_db/eligible_att_incentive_routes.js";








import courseCategoryRoutes from "./routes/lms/course_category_routes.js";
import courseRoutes from "./routes/lms/course_routes.js";
import materialRoutes from "./routes/lms/material_routes.js";
import submissionRoutes from "./routes/lms/submission_routes.js";
import userRoutes from "./routes/lms/user_routes.js";
import questionRoutes from "./routes/lms/question_routes.js";
import trainerRoutes from "./routes/lms/trainer_routes.js";
import enrollRoutes from "./routes/lms/enroll_routes.js";











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

//sync_db
app.use("/employees", employeeRoutes);
app.use("/admins", adminRoutes);
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
app.use("/payrolls", authenticateToken, payrollRoutes);
app.use("/complexity", authenticateToken, complexityRoutes);
app.use("/attendance_incentives", authenticateToken, attendanceIncentivesRoutes);
app.use("/signatures", authenticateToken, signatureRoutes);
app.use("/mood_meters", authenticateToken, moodMeterRoutes);
app.use("/incident_reports", authenticateToken, incidentReportRoutes);
app.use("/eligible_att_incentives", eligibleAttendanceIncentive);








//lms
app.use("/course_catergory", authenticateToken, courseCategoryRoutes);
app.use("/courses", authenticateToken, courseRoutes);
app.use("/materials", authenticateToken, materialRoutes);
app.use("/submissions", authenticateToken, submissionRoutes);
app.use("/users", authenticateToken, userRoutes);
app.use("/questions", authenticateToken, questionRoutes);
app.use("/enrolls", authenticateToken, enrollRoutes);
app.use("/trainers", authenticateToken, trainerRoutes);







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


