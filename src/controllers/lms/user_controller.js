import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db2 } from '../../config/config.js'; // Import the database connection

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


function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return the formatted expiration date-time
    return formattedExpirationDateTime;
}

export const create_user = asyncHandler(async (req, res) => {
    const { emp_id } = req.body;

    try {
        const sql = 'INSERT INTO users (emp_ID, date_created) VALUES (?, ?)';
        const [insert_data_submission] = await db2.query(sql, [emp_id, storeCurrentDate(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'User successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create user.' });
    }
});


export const get_all_user = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, emp_ID, 
        DATE_FORMAT(date_created, '%Y-%m-%d') AS date_created
        FROM users`; // Use a parameterized query
                                  
        const [users] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const check_user = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = `SELECT id, emp_ID, 
        DATE_FORMAT(date_created, '%Y-%m-%d') AS date_created
        FROM users WHERE emp_ID = ?`; // Use a parameterized query
                                  
        const [users] = await db2.query(sql, [emp_id]);

        if(users.length >= 1) {
            return res.status(200).json({ data: users });
        }

        return res.status(404).json({ message: 'User  not found.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

