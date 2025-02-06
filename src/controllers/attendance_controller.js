import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';



// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedCurrentDateTime = currentDateTime.format('YYYY-MM-DD HH:mm:ss');
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
    // return {
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}


export const create_attendance_time_in = asyncHandler(async (req, res) => {
    const { emp_id, time_in, cluster_id } = req.body;

    try {
        const sql = 'INSERT INTO attendance (emp_ID, timeIN, clusterID, date ) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_site] = await db.promise().query(sql, [emp_id, time_in, cluster_id, storeCurrentDateTime(0, 'hours') ]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Attendance successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create attendance.' });
    }
});

export const update_attendance_time_out = asyncHandler(async (req, res) => {
    const { time_out } = req.body;
    const { attendance_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql = 'UPDATE attendance SET timeOUT = ? WHERE id = ?';
        const [insert_data_site] = await db.promise().query(sql, [time_out, attendance_id ]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Attendance successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update attendance.' });
    }
});


  
  