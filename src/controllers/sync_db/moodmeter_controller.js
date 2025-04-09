import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
}

export const create_moodmeter = asyncHandler(async (req, res) => {
    const { emp_id, mood } = req.body;

    try {
        const sql  = `SELECT * FROM moodmeter WHERE emp_ID = ? AND DATE_FORMAT(date, '%Y-%m-%d') = ?`; // Use a parameterized query
        const sql2 = 'INSERT INTO moodmeter (emp_ID, mood, date) VALUES (?, ?, ?)';

        const [moodmeter] = await db.query(sql, [emp_id, storeCurrentDate(0, 'hours')]);

        if (moodmeter.length >= 1) {
            return res.status(400).json({ error: 'You have already submitted your mood meter today.' });
        }
    
        const [insert_data_eod] = await db.query(sql2, [emp_id, mood, storeCurrentDate(0, 'hours')]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Mood meter successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create mood meter.' });
    }
});

export const get_all_user_moodmeter = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming site_id is passed as a URL parameter

    try {
        const sql  = `SELECT id, emp_ID, mood, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM moodmeter WHERE emp_ID = ?`; // Use a parameterized query

        const [moodmeter] = await db.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: moodmeter });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_moodmeter = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, emp_ID, mood, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM moodmeter`; // Use a parameterized query

        const [moodmeter] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: moodmeter });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

