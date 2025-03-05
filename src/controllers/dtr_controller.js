import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


export const get_all_dtr = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM dtr'; // Use a parameterized query

        const [dtr] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: dtr });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

