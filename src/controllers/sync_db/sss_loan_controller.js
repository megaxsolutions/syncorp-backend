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


export const get_all_sss_loan = asyncHandler(async (req, res) => {
    try {
        const sql  = `
            SELECT 
                sss_loan.id,
                sss_loan.emp_ID,
                sss_loan.payroll_id_start,
                sss_loan.payroll_id_end,
                sss_loan.amount,
                CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname
            FROM 
                sss_loan
            LEFT JOIN
                employee_profile ON sss_loan.emp_ID = employee_profile.emp_ID
        `; // parameterized query
                                  


        const [sss_loan] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: sss_loan });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const create_sss_loan = asyncHandler(async (req, res) => {
    const { emp_id, amount, payroll_id_start, payroll_id_end } = req.body;

    try {
        const sql_insert = 'INSERT INTO sss_loan (emp_ID, amount, payroll_id_start, payroll_id_end) VALUES (?, ?, ?, ?)';
  
        const [insert_data_sss_loan] = await db.query(sql_insert, [emp_id, amount, payroll_id_start, payroll_id_end]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'SSS loan successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create sss loan.' });
    }
});


export const update_sss_loan = asyncHandler(async (req, res) => {
    const { emp_id, amount, payroll_id_start, payroll_id_end } = req.body;
    const { sss_loan_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'UPDATE sss_loan SET emp_id = ?, amount = ?, payroll_id_start = ?, payroll_id_end = ?  WHERE id = ?';

        const [update_data_sss_loan] = await db.query(sql, [emp_id, amount, payroll_id_start, payroll_id_end, sss_loan_id]);
 
        // Return the merged results in the response
        return res.status(200).json({ success: 'SSS loan successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update sss loan.' });
    }
});



export const delete_sss_loan  = asyncHandler(async (req, res) => {
    const { sss_loan_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM sss_loan WHERE id = ?';

        const [result] = await db.query(sql, [sss_loan_id]);

        return res.status(200).json({ success: 'SSS loan successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete sss loan.' });
    }
});
