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

export const create_complexity = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id } = req.body;

    try {
        const sql = 'INSERT INTO complexity (emp_ID, amount, cutoff_ID) VALUES (?, ?, ?)';
        const [insert_data_att_incentive] = await db.query(sql, [emp_id, amount, cutoff_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Complexity successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create complexity.' });
    }
});

export const update_complexity = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id } = req.body;
    const { complexity_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE complexity SET emp_ID = ?, amount = ?, cutoff_ID = ? WHERE id = ?`;

        const [update_data_material] = await db.query(sql, [emp_id, amount, cutoff_id, complexity_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Complexity successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update complexity.' });
    }
});



export const get_all_complexity = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, emp_ID, amount, cutoff_ID
        FROM complexity`; // Use a parameterized query
                                  
        const [complexity] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: complexity });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_complexity = asyncHandler(async (req, res) => {
    const { complexity_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM complexity WHERE id = ?';

        const [result] = await db.query(sql, [complexity_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Complexitynot found.' });
        }

        return res.status(200).json({ success: 'Complexity successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete complexity.' });
    }
});
