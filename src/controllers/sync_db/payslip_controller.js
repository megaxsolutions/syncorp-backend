import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


export const get_all_payslip = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM payslip'; // Use a parameterized query

        const [payslip] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: payslip });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_user_payslip = asyncHandler(async (req, res) => {
    const { emp_id, cutoff_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM payslip WHERE emp_ID = ? AND cutoffID = ?'; // Use a parameterized query

        const [payslip] = await db.query(sql, [emp_id, cutoff_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: payslip });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_user_payslip_admin = asyncHandler(async (req, res) => {
    const { cutoff_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM payslip WHERE cutoffID = ?'; // Use a parameterized query

        const [payslip] = await db.query(sql, [cutoff_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: payslip });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
