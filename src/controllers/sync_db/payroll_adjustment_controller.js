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

export const get_all_payroll_adjustment = asyncHandler(async (req, res) => {
    try {
        const sql  = `
            SELECT 
                payroll_adjustments.id,
                payroll_adjustments.emp_ID,
                payroll_adjustments.amount,
                payroll_adjustments.payroll_id,
                payroll_adjustments.status,
                DATE_FORMAT(cutoff.startDate, '%Y-%m-%d') AS startDate,
                DATE_FORMAT(cutoff.endDate, '%Y-%m-%d') AS endDate,
                CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname
            FROM 
                payroll_adjustments
            LEFT JOIN
                employee_profile ON payroll_adjustments.emp_ID = employee_profile.emp_ID
            LEFT JOIN
                cutoff ON payroll_adjustments.payroll_id = cutoff.id
            ORDER BY 
                payroll_adjustments.id DESC
        `; // parameterized query
                                  


        const [payroll_adjustments] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: payroll_adjustments });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const create_payroll_adjustment = asyncHandler(async (req, res) => {
    const { emp_id, amount, payroll_id, status } = req.body;

    try {
        const sql_insert = 'INSERT INTO payroll_adjustments (emp_ID, amount, payroll_id, status) VALUES (?, ?, ?, ?)';
  
        const [insert_data_payroll_adjustment] = await db.query(sql_insert, [emp_id, amount, payroll_id, status]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Payroll adjustment successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create payroll adjustment.' });
    }
});

export const update_payroll_adjustment = asyncHandler(async (req, res) => {
    const { emp_id, amount, payroll_id, status } = req.body;
    const { payroll_adjustment_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'UPDATE payroll_adjustments SET emp_id = ?, amount = ?, payroll_id = ?, status = ?  WHERE id = ?';

        const [update_data_payroll_adjustment] = await db.query(sql, [emp_id, amount, payroll_id, status, payroll_adjustment_id]);
 
        // Return the merged results in the response
        return res.status(200).json({ success: 'Payroll adjustment successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update payroll adjustment.' });
    }
});



export const delete_payroll_adjustment  = asyncHandler(async (req, res) => {
    const { payroll_adjustment_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM payroll_adjustments WHERE id = ?';

        const [result] = await db.query(sql, [payroll_adjustment_id]);

        return res.status(200).json({ success: 'Payroll adjustment successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete payroll adjustment.' });
    }
});
