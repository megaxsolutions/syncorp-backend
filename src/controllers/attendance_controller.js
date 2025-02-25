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

    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    return formattedExpirationDateTime;
}

function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    return formattedExpirationDateTime;
}

export const create_attendance_time_in = asyncHandler(async (req, res) => {
    const { emp_id, cluster_id } = req.body;

    try {
        const sql  = `SELECT day FROM shift_schedule WHERE emp_ID = ? AND DATE_FORMAT(day, '%Y-%m-%d') = ?`; // Use a parameterized query
        const sql2 = 'INSERT INTO attendance (emp_ID, timeIN, clusterID, date ) VALUES (?, ?, ?, ?)';
        const sql3 = 'UPDATE clock_state SET state = ? WHERE emp_ID = ?';

        const [shift_schedule] = await db.query(sql, [emp_id, storeCurrentDate(0, 'hours')]);
 

        if(shift_schedule.length > 0) {
            const [insert_data_site] = await db.query(sql2, [emp_id, storeCurrentDateTime(0, 'hours'), cluster_id, storeCurrentDate(0, 'hours')]);
            const [update_data_clock_state] = await db.query(sql3, [1, emp_id]);   

            return res.status(200).json({ success: 'Attendance successfully created.' }); 
        }
       
        return res.status(400).json({ success: 'Please contact the admin for scheduling.' });
        // Return the merged results in the response
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create attendance.' });
    }
});

export const update_attendance_time_out = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM attendance WHERE emp_ID = ? ORDER BY id DESC LIMIT 1';
        const sql2 = 'UPDATE attendance SET timeOUT = ? WHERE id = ?';
        const sql3 = 'UPDATE clock_state SET state = ? WHERE emp_ID = ?';

        const [attendance] = await db.query(sql, [emp_id]);
        const [update_data_attendance] = await db.query(sql2, [storeCurrentDateTime(0, 'hours'), attendance[0]['id']]);
        const [update_data_clock_state] = await db.query(sql3, [0, emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Attendance successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update attendance.' });
    }
});

export const get_user_clock_state = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter
    const sql = 'SELECT emp_ID, state, break_state FROM clock_state WHERE emp_ID = ? ORDER BY id DESC LIMIT 1';

    const [clock_state] = await db.query(sql, [emp_id]); // Use 'sql' instead of 'sql2'

    return res.status(200).json({ data: clock_state });
});

export const get_user_latest_attendance = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `
        SELECT 
            DATE_FORMAT(date, '%Y-%m-%d') AS date, 
            DATE_FORMAT(timeIN, '%Y-%m-%d %H:%i:%s') AS time_in, 
            DATE_FORMAT(timeOUT, '%Y-%m-%d %H:%i:%s') AS time_out 
        FROM 
            attendance 
        WHERE 
            emp_ID = ? 
        ORDER BY 
            id DESC 
        LIMIT 1`;

        const [attendance] = await db.query(sql, [emp_id]); // Use 'sql' instead of 'sql2'

        const result = {  
            time_in: attendance[0]['time_in'],
            time_out: attendance[0]['time_out'],
            date: attendance[0]['date'],
        };

        // Return the merged results in the response
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get attendance data.' });
    }
});

export const get_all_user_attendance = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `SELECT 
                    DATE_FORMAT(timeIN, '%Y-%m-%d %H:%i:%s') AS timeIN,
                    DATE_FORMAT(timeOUT, '%Y-%m-%d %H:%i:%s') AS timeOUT, 
                    DATE_FORMAT(date, '%Y-%m-%d') AS date, 
                    clusterID FROM attendance WHERE emp_ID = ?`; // Use a parameterized query

        const [attendance] = await db.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: attendance });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_attendance = asyncHandler(async (req, res) => {
    try {
        const sql = `SELECT 
                    DATE_FORMAT(timeIN, '%Y-%m-%d %H:%i:%s') AS timeIN,
                    DATE_FORMAT(timeOUT, '%Y-%m-%d %H:%i:%s') AS timeOUT, 
                    DATE_FORMAT(date, '%Y-%m-%d') AS date, 
                    clusterID FROM attendance`; // Use a parameterized query

        const [attendance] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: attendance });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});