import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


export const get_all_eligible_att_incentive = asyncHandler(async (req, res) => {
    const { cutoff_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = `SELECT eligible_att_incentives.id,
        eligible_att_incentives.emp_ID,
        CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullName,
        amount, cutoffID, cutoff_period
        FROM eligible_att_incentives
        LEFT JOIN employee_profile ON eligible_att_incentives.emp_ID = employee_profile.emp_ID`; // Use a parameterized query

        const [eligible_att_incentives] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: eligible_att_incentives });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const create_eligible_att_incentive = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query
        const sql2  = 'SELECT * FROM incident_report'; // Use a parameterized query

        const sql3 = 'INSERT INTO eligible_att_incentives (emp_ID, amount, cutoffID, cutoff_period) VALUES (?, ?, ?, ?)';


        const [logins] = await db.query(sql);

        const logins_user = await Promise.all(
            logins.map(async (login) => {
               // console.log(login.emp_ID);
                return login;
            })
        );

        
      //  const [insert_data_eligible_att_incentives] = await db.query(sql2, [date, storeCurrentDateTime(0, 'hours'), holiday_name, holiday_type]);

        // Return the merged results in the response
        return res.status(200).json({ data: 123 });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


