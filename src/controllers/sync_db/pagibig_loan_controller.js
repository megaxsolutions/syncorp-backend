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


export const get_all_pagibig_loan = asyncHandler(async (req, res) => {
    try {
        const sql  = `
            SELECT 
                pagibig_loan.id,
                pagibig_loan.emp_ID,
                pagibig_loan.payroll_id_start,
                DATE_FORMAT(pagibig_loan.start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(pagibig_loan.end_date, '%Y-%m-%d') AS end_date,
                pagibig_loan.payroll_id_end,
                pagibig_loan.amount,
                CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname
            FROM 
                pagibig_loan
            LEFT JOIN
                employee_profile ON pagibig_loan.emp_ID = employee_profile.emp_ID
        `; // parameterized query
                                  


        const [pagibig_loan] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: pagibig_loan });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const create_pagibig_loan = asyncHandler(async (req, res) => {
    const { emp_id, amount, start_date, end_date } = req.body;

    try {
        const sql_insert = 'INSERT INTO pagibig_loan (emp_ID, amount, start_date, end_date) VALUES (?, ?, ?, ?)';
  
        const [insert_data_rating] = await db.query(sql_insert, [emp_id, amount, start_date, end_date]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Pagibig loan successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create pagibig loan.' });
    }
});

export const update_pagibig_loan = asyncHandler(async (req, res) => {
    const { emp_id, amount, start_date, end_date } = req.body;
    const { pagibig_loan_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'UPDATE pagibig_loan SET emp_id = ?, amount = ?, start_date = ?, end_date = ? WHERE id = ?';

        const [update_data_pagibig_loan] = await db.query(sql, [emp_id, amount, start_date, end_date, pagibig_loan_id]);
 
        // Return the merged results in the response
        return res.status(200).json({ success: 'Pagibig loan successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update pagibig loan.' });
    }
});



export const delete_pagibig_loan  = asyncHandler(async (req, res) => {
    const { pagibig_loan_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM pagibig_loan WHERE id = ?';

        const [result] = await db.query(sql, [pagibig_loan_id]);

        return res.status(200).json({ success: 'Pagibig loan successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete pagibig loan.' });
    }
});
