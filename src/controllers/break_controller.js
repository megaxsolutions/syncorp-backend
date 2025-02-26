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

    // Format the expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return the formatted expiration date-time
    return formattedExpirationDateTime;
}

export const create_break = asyncHandler(async (req, res) => {
    const { emp_id } = req.body;

    try {
        const sql = 'INSERT INTO breaks (breakIN, emp_ID) VALUES (?, ?)';
        const sql2 = 'UPDATE clock_state SET break_state = ? WHERE emp_ID = ?';
        const [insert_data_break] = await db.query(sql, [storeCurrentDateTime(0, 'hours'), emp_id]);
        const [update_data_clock_break_state] = await db.query(sql2, [1, emp_id]);

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Break successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create break.' });
    }
});

export const update_break_break_out = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM breaks WHERE emp_ID = ? ORDER BY id DESC LIMIT 1';
        const sql2 = 'UPDATE breaks SET breakOUT = ? WHERE id = ?';
        const sql3 = 'UPDATE clock_state SET break_state = ? WHERE emp_ID = ?';

        const [breaks] = await db.query(sql, [emp_id]);
        const [update_data_breaks] = await db.query(sql2, [storeCurrentDateTime(0, 'hours'), breaks[0]['id']]);
        const [update_data_clock_break_state] = await db.query(sql3, [0, emp_id]);

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Break successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update break.' });
    }
});

export const get_all_user_break = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {

        const sql  = `SELECT id,
        emp_ID,
        DATE_FORMAT(breakIN, '%Y-%m-%d %H:%i:%s') AS breakIN,  
        DATE_FORMAT(breakOUT, '%Y-%m-%d %H:%i:%s') AS breakOUT
        FROM breaks WHERE emp_ID = ?`; // Use a parameterized query
                                  
        const [breaks] = await db.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: breaks });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_break = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id,
        emp_ID,
        DATE_FORMAT(breakIN, '%Y-%m-%d %H:%i:%s') AS breakIN,  
        DATE_FORMAT(breakOUT, '%Y-%m-%d %H:%i:%s') AS breakOUT
        FROM breaks`; // Use a parameterized query
                                  
        const [breaks] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: breaks });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
