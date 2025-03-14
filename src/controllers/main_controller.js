import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


export const get_all_dropdown_data = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM departments'; // Use a parameterized query
        const sql2 = 'SELECT * FROM clusters'; // Use a parameterized query
        const sql3 = `SELECT 
        id, siteName,
        DATE_FORMAT(stamp, '%Y-%m-%d') AS stamp
        FROM sites`; // Use a parameterized query
        const sql4 = 'SELECT * FROM positions'; // Use a parameterized query
        const sql5 = 'SELECT * FROM employee_levels'; // Use a parameterized query
        const sql6 = 'SELECT * FROM admin_level'; // Use a parameterized query
        const sql7 = `SELECT id,
        DATE_FORMAT(startDate, '%Y-%m-%d') AS startDate,
        DATE_FORMAT(endDate, '%Y-%m-%d') AS endDate
        FROM cutoff`; // Use a parameterized query



        const [departments] = await db.query(sql);
        const [clusters] = await db.query(sql2);
        const [sites] = await db.query(sql3);
        const [positions] = await db.query(sql4);
        const [employee_levels] = await db.query(sql5);
        const [admin_level] = await db.query(sql6);
        const [cutoff] = await db.query(sql7);




          // Merge the results into a single object
          const result = {
            departments,
            clusters,
            sites,
            positions,
            employee_levels,
            admin_level,
            cutoff
        };

        // Return the merged results in the response
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
  
  