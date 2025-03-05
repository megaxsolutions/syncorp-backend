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
        const sql  = `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM attendance WHERE emp_ID = ? AND date = ?`;
        const sql2 = `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM attendance WHERE emp_ID = ? AND date = ? AND timeOUT IS NOT NULL`;
        const sql3 = 'INSERT INTO attendance (emp_ID, timeIN, clusterID, date ) VALUES (?, ?, ?, ?)';
        const sql4 = 'UPDATE clock_state SET state = ? WHERE emp_ID = ?';

        //const [attendance] = await db.query(sql, [emp_id, storeCurrentDate(0, 'hours')]);
       // const [attendance_overtime] = await db.query(sql2, [emp_id, storeCurrentDate(0, 'hours')]);


       // if(attendance.length == 0) {
            const [insert_data_site] = await db.query(sql3, [emp_id, storeCurrentDateTime(0, 'hours'), cluster_id, storeCurrentDate(0, 'hours')]);
            const [update_data_clock_state] = await db.query(sql4, [1, emp_id]);   

            return res.status(200).json({ success: 'Attendance recorded successfully.' });        
        //}

        // if(attendance_overtime.length >= 1) {
        //     const [insert_data_site] = await db.query(sql3, [emp_id, storeCurrentDateTime(0, 'hours'), cluster_id, storeCurrentDate(0, 'hours')]);
        //     const [update_data_clock_state] = await db.query(sql4, [1, emp_id]);   

        //     return res.status(200).json({ success: 'Your recorded time has been classified as overtime.' });        
        // }

       // return res.status(400).json({ error: 'You have already marked your attendance for today.' });        
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
        const sql = `
        SELECT attendance.id, attendance.emp_ID,
            DATE_FORMAT(attendance.timeIN, '%Y-%m-%d %H:%i:%s') AS timeIN,
            DATE_FORMAT(attendance.timeOUT, '%Y-%m-%d %H:%i:%s') AS timeOUT, 
            DATE_FORMAT(attendance.date, '%Y-%m-%d') AS date, 
            attendance.clusterID,
            CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullName
        FROM attendance
        LEFT JOIN employee_profile ON attendance.emp_ID = employee_profile.emp_ID
        WHERE attendance.emp_ID = ?`;

        const [attendance] = await db.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: attendance });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_attendance = asyncHandler(async (req, res) => {
    try {
        const sql = `
        SELECT attendance.id, attendance.emp_ID,
            DATE_FORMAT(attendance.timeIN, '%Y-%m-%d %H:%i:%s') AS timeIN,
            DATE_FORMAT(attendance.timeOUT, '%Y-%m-%d %H:%i:%s') AS timeOUT, 
            DATE_FORMAT(attendance.date, '%Y-%m-%d') AS date, 
            attendance.clusterID,
            CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullName
        FROM attendance
        LEFT JOIN employee_profile ON attendance.emp_ID = employee_profile.emp_ID`;


        const [attendance] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: attendance });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});




export const update_user_attendance = asyncHandler(async (req, res) => {
    const { time_in, time_out } = req.body;
    const { emp_id, attendance_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'UPDATE attendance SET timeIN = ?, timeOUT = ? WHERE emp_ID = ? AND id = ?';
        const [result] = await db.query(sql, [time_in, time_out, emp_id, attendance_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance not found.' });
        }

        return res.status(200).json({ success: 'Attendance successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update attendance.' });
    }
});

export const delete_attendance = asyncHandler(async (req, res) => {
    const { attendance_id, emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql  = `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM attendance WHERE id = ? AND emp_ID = ? AND date = ?`; // Use a parameterized query
        const sql2 = 'DELETE FROM attendance WHERE id = ? AND emp_ID = ?';
       // const sql3 = 'UPDATE clock_state SET state = ? WHERE emp_ID = ?';

        const [data_attendance] = await db.query(sql, [attendance_id, emp_id, storeCurrentDate(0, 'hours')]);

        if(data_attendance.length >= 1) {
            return res.status(400).json({ error: 'Unable to delete attendance: This record is protected and cannot be removed.' });
          //  const [update_data_clock_state] = await db.query(sql3, [0, emp_id]);   
        }

        const [result] = await db.query(sql2, [attendance_id, emp_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance not found.' });
        }

        return res.status(200).json({ success: 'Attendance successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete attendance.' });
    }
});
