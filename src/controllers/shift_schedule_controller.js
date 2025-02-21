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


function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
}

export const create_shift_schedule_current_day = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_shift_schedule] = await db.promise().query(sql, [array_employee_emp_id, shift_in, shift_out, storeCurrentDate(0, 'hours'), admin_emp_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Shift schedule successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create shift schedule.' });
    }
});

export const create_shift_schedule_current_weekday = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_shift_schedule] = await db.promise().query(sql, [array_employee_emp_id, shift_in, shift_out, storeCurrentDate(0, 'hours'), admin_emp_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Shift schedule successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create shift schedule.' });
    }
});


export const create_shift_schedule_current_month = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_shift_schedule] = await db.promise().query(sql, [array_employee_emp_id, shift_in, shift_out, storeCurrentDate(0, 'hours'), admin_emp_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Shift schedule successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create shift schedule.' });
    }
});



