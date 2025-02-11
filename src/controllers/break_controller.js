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

export const create_break = asyncHandler(async (req, res) => {
    try {
        const sql = 'INSERT INTO breaks (breakIN) VALUES (?)';
        const [insert_data_break] = await db.promise().query(sql, [storeCurrentDateTime(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Break successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create break.' });
    }
});


export const update_break_break_out = asyncHandler(async (req, res) => {
    const { break_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql = 'UPDATE breaks SET breakOUT = ? WHERE id = ?';
        const [update_data_break] = await db.promise().query(sql, [storeCurrentDateTime(0, 'hours'), break_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Break successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update break.' });
    }
});



export const get_all_break = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM breaks'; // Use a parameterized query

        const [breaks] = await db.promise().query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: breaks });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

