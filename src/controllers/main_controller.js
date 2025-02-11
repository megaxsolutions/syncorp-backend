import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';


export const get_all_dropdown_data = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM departments'; // Use a parameterized query
        const sql2 = 'SELECT * FROM clusters'; // Use a parameterized query
        const sql3 = 'SELECT * FROM sites'; // Use a parameterized query
        const sql4 = 'SELECT * FROM positions'; // Use a parameterized query
        const sql5 = 'SELECT * FROM employee_levels'; // Use a parameterized query
        const sql6 = 'SELECT * FROM admin_level'; // Use a parameterized query



        const [departments] = await db.promise().query(sql);
        const [clusters] = await db.promise().query(sql2);
        const [sites] = await db.promise().query(sql3);
        const [positions] = await db.promise().query(sql4);
        const [employee_levels] = await db.promise().query(sql5);
        const [admin_level] = await db.promise().query(sql6);



          // Merge the results into a single object
          const result = {
            departments,
            clusters,
            sites,
            positions,
            employee_levels,
            admin_level
        };

        // Return the merged results in the response
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
  
  