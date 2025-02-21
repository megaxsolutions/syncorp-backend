import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';

// Function to get the current date and time in Asia/Manila
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD HH:mm:ss');
}

function storeCurrentDate(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD');
}

export const create_shift_schedule_current_day = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_shift_schedule] = await db.query(sql, [array_employee_emp_id, shift_in, shift_out, storeCurrentDate(0, 'hours'), admin_emp_id]);
      
        return res.status(200).json({ success: 'Shift schedule successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create shift schedule.' });
    }
});

export const create_shift_schedule_current_weekday = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_shift_schedule] = await db.query(sql, [array_employee_emp_id, shift_in, shift_out, storeCurrentDate(0, 'hours'), admin_emp_id]);
      
        return res.status(200).json({ success: 'Shift schedule successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create shift schedule.' });
    }
});

export const create_shift_schedule_current_month = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_shift_schedule] = await db.query(sql, [array_employee_emp_id, shift_in, shift_out, storeCurrentDate(0, 'hours'), admin_emp_id]);
      
        return res.status(200).json({ success: 'Shift schedule successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create shift schedule.' });
    }
});