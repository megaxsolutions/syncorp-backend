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



export const create_att_incentive = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id, status, supervisor_emp_id } = req.body;

    try {
        const sql = 'INSERT INTO att_incentives (emp_ID, amount, cutoff_ID, status, plotted_by, approved_by, datetime_approved) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_att_incentive] = await db.query(sql, [emp_id, amount, cutoff_id, status, supervisor_emp_id, supervisor_emp_id, storeCurrentDateTime(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Attendance incentive successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create attendance incentive.' });
    }
});

export const update_att_incentive = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id } = req.body;
    const { att_incentive_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE att_incentives SET emp_ID = ?, amount = ?, cutoff_ID = ? WHERE id = ?`;

        const [update_data_material] = await db.query(sql, [emp_id, amount, cutoff_id, att_incentive_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Attendance incentive successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update attendance incentive.' });
    }
});


export const update_approval_att_incentive_admin = asyncHandler(async (req, res) => {
    const { status, admin_emp_id } = req.body;
    const { att_incentive_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'UPDATE att_incentives SET status2 = ?, approved_by2 = ?, datetime_approved2 = ? WHERE id = ?';
        const [update_data_bonus] = await db.query(sql, [status, admin_emp_id, storeCurrentDateTime(0, 'hours'), att_incentive_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus approval successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bonus.' });
    }
});

export const get_all_att_incentive = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, emp_ID, amount, cutoff_ID
        FROM att_incentives`; // Use a parameterized query
                                  
        const [att_incentives] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: att_incentives });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_att_incentive = asyncHandler(async (req, res) => {
    const { att_incentive_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM att_incentives WHERE id = ?';

        const [result] = await db.query(sql, [att_incentive_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance incentive not found.' });
        }

        return res.status(200).json({ success: 'Attendance incentive successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete attendance incentive.' });
    }
});
