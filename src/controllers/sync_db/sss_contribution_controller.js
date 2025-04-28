import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

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

export const get_all_sss_contribution = asyncHandler(async (req, res) => {
    try {
        const sql  = `
            SELECT 
                sss_contribution.id,
                sss_contribution.emp_ID,
                sss_contribution.ee_amount,
                CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname
            FROM 
                sss_contribution
            LEFT JOIN
                employee_profile ON sss_contribution.emp_ID = employee_profile.emp_ID
        `; // parameterized query
                                  


        const [sss_contribution] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: sss_contribution });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const create_sss_contribution = asyncHandler(async (req, res) => {
    const { emp_id, ee_amount } = req.body;

    try {
        const sql_insert = 'INSERT INTO sss_contribution (emp_ID, ee_amount) VALUES (?, ?)';
  
        const [insert_data_sss_contribution] = await db.query(sql_insert, [emp_id, ee_amount]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'SSS contribution successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create sss contribution.' });
    }
});

export const update_sss_contribution = asyncHandler(async (req, res) => {
    const { emp_id, ee_amount } = req.body;
    const { sss_contribution_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'UPDATE sss_contribution SET emp_id = ?, ee_amount = ? WHERE id = ?';

        const [update_data_sss_contribution] = await db.query(sql, [emp_id, ee_amount, sss_contribution_id]);
 
        // Return the merged results in the response
        return res.status(200).json({ success: 'SSS contribution successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update sss contribution.' });
    }
});



export const delete_sss_contribution  = asyncHandler(async (req, res) => {
    const { sss_contribution_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM sss_contribution WHERE id = ?';

        const [result] = await db.query(sql, [sss_contribution_id]);

        return res.status(200).json({ success: 'SSS contribution successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete sss contribution.' });
    }
});
