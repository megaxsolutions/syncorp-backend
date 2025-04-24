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

export const create_rating = asyncHandler(async (req, res) => {
    const { emp_id, rating, comment, course_id } = req.body;


    try {
        const sql = 'INSERT INTO ratings (emp_ID, rating, datetime, comment, courseID) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_rating] = await db2.query(sql, [emp_id, rating, storeCurrentDateTime(0, 'hours'), comment, course_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Rating successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create rating.' });
    }
});


export const update_rating = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const { rating_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'UPDATE ratings SET rating = ?, comment = ? WHERE id = ?';

        const [update_data_rating] = await db2.query(sql, [rating, comment, rating_id]);
 
        // Return the merged results in the response
        return res.status(200).json({ success: 'Rating successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update rating.' });
    }
});



export const delete_rating  = asyncHandler(async (req, res) => {
    const { rating_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM ratings WHERE id = ?';

        const [result] = await db2.query(sql, [rating_id]);

        return res.status(200).json({ success: 'Rating successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete rating.' });
    }
});
