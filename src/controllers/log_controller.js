import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


export const get_all_user_log = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter
    
    try {
        const sql  = 'SELECT * FROM log WHERE emp_ID = ? ORDER BY id DESC'; // Use a parameterized query

        const [log] = await db.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: log });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});




export const read_user_specific_log = asyncHandler(async (req, res) => {
    const { emp_id, log_id } = req.params; // Assuming department_id is passed as a URL parameter
    
    try {
        const sql = 'UPDATE log SET is_read = ? WHERE id = ? AND emp_ID = ?';

        const [log] = await db.query(sql, [1, log_id, emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: log });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const read_user_all_log = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'UPDATE log SET is_read = ? WHERE emp_ID = ?';

        const [log] = await db.query(sql, [1, emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: log });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

