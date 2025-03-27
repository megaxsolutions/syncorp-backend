import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


export const get_all_payroll = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM payroll'; // Use a parameterized query

        const [payroll] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: payroll });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
