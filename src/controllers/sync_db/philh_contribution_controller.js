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


export const get_all_philh_contribution= asyncHandler(async (req, res) => {
    try {
        const sql  = `
            SELECT 
                philh_contribution.id,
                philh_contribution.emp_ID,
                philh_contribution.ee_amount,
                CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname
            FROM 
                philh_contribution
            LEFT JOIN
                employee_profile ON philh_contribution.emp_ID = employee_profile.emp_ID
        `; // parameterized query
                                  


        const [philh_contribution] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: philh_contribution });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const create_philh_contribution = asyncHandler(async (req, res) => {
    const { emp_id, ee_amount } = req.body;

    try {
        const sql_insert = 'INSERT INTO philh_contribution (emp_ID, ee_amount) VALUES (?, ?)';
  
        const [insert_data_philh_contribution] = await db.query(sql_insert, [emp_id, ee_amount]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'PhilHealth contribution successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create PhilHealth contribution.' });
    }
});


export const update_philh_contribution = asyncHandler(async (req, res) => {
    const { emp_id, ee_amount } = req.body;
    const { philh_contribution_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'UPDATE philh_contribution SET emp_id = ?, ee_amount = ? WHERE id = ?';

        const [update_data_philh_contribution] = await db.query(sql, [emp_id, ee_amount, philh_contribution_id]);
 
        // Return the merged results in the response
        return res.status(200).json({ success: 'PhilHealth contribution successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update PhilHealth contribution.' });
    }
});



export const delete_philh_contribution  = asyncHandler(async (req, res) => {
    const { philh_contribution_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM philh_contribution WHERE id = ?';

        const [result] = await db.query(sql, [philh_contribution_id]);

        return res.status(200).json({ success: 'PhilHealth contribution successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete PhilHealth contribution.' });
    }
});
