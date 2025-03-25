import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


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


export const create_adjustment = asyncHandler(async (req, res) => {
    const { time_in, time_out, emp_id, reason } = req.body;
    const { attendance_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql  = 'SELECT * FROM adjustment WHERE attendance_id = ?'; // Use a parameterized query
        const sql2 = 'INSERT INTO adjustment (date, timein, timeout, emp_ID, status, reason, attendance_id) VALUES (?, ?, ?, ?, ?, ?, ?)';


        const [data_adjustment] = await db.query(sql, [attendance_id]);

        if (data_adjustment.length >= 1) {
            return res.status(400).json({ error: 'Adjustment already exist.' });
        }

        const [adjustment] = await db.query(sql2, [storeCurrentDate(0, 'hours'), time_in, time_out, emp_id, 0, reason, attendance_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Adjustment successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create adjustment.' });
    }
});




export const update_approval_adjustment = asyncHandler(async (req, res) => {
    const { status, admin_emp_id } = req.body;
    const { adjustment_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql   = 'SELECT * FROM adjustment WHERE id = ? AND status != 0'; // Use a parameterized query
        const sql2  = 'SELECT * FROM adjustment WHERE id = ? AND status = 0'; // Use a parameterized query
        const sql3 = 'UPDATE adjustment SET status = ?, approved_by = ?, date_approved_by = ? WHERE id = ?';
        const sql4 = 'UPDATE attendance SET timeIN = ?, timeOUT = ? WHERE id = ?';

        const [data_adjustment] = await db.query(sql, [adjustment_id]);
        const [data_adjustment_2] = await db.query(sql2, [adjustment_id]);


        if (data_adjustment.length >= 1) {
            return res.status(400).json({ error: 'This adjustment has already been processed.' });        
        }      


        const [update_adjustment] = await db.query(sql3, [status, admin_emp_id, storeCurrentDate(0, 'hours'), adjustment_id]);
        const [update_attendance] = await db.query(sql4, [data_adjustment_2[0]['timein'], data_adjustment_2[0]['timeout'], data_adjustment_2[0]['attendance_id']]);

        return res.status(200).json({ success: 'Adjustment successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update adjustment.'  });
    }
});



export const update_adjustment = asyncHandler(async (req, res) => {
    const { time_in, time_out, reason } = req.body;
    const { adjustment_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
       // const sql  = 'SELECT * FROM adjustment WHERE id = ? AND status != ?'; // Use a parameterized query
        const sql  = 'SELECT * FROM adjustment WHERE id = ? AND status != 0'; // Use a parameterized query
        const sql2 = 'UPDATE adjustment SET timein = ?, timeout = ?, reason = ? WHERE id = ?';

        const [data_adjustment] = await db.query(sql, [adjustment_id]);

        if (data_adjustment.length >= 1) {
            return res.status(400).json({ error: 'This adjustment has already been processed.' });        
        }      


        const [result] = await db.query(sql2, [time_in, time_out, reason, adjustment_id]);

        return res.status(200).json({ success: 'Adjustment successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update adjustment.'  });
    }
});


export const delete_adjustment = asyncHandler(async (req, res) => {
    const { adjustment_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM adjustment WHERE id = ? AND status != 0'; // Use a parameterized query
        const sql2 = 'DELETE FROM adjustment WHERE id = ?';

        const [data_adjustment] = await db.query(sql, [adjustment_id]);
        
        if (data_adjustment.length >= 1) {
            return res.status(400).json({ error: 'This adjustment has already been processed.' });        
        }     

        const [result] = await db.query(sql2, [adjustment_id]);

        return res.status(200).json({ success: 'Adjustment successfully deleted.' });
        
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete adjustment.' });
    }
});



export const get_all_user_adjustment = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM adjustment WHERE emp_ID = ?'; // Use a parameterized query

        const [adjustment] = await db.query(sql, [emp_id]);
   
        // Return the merged results in the response
        return res.status(200).json({ data: adjustment });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const get_all_adjustment = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM adjustment'; // Use a parameterized query

        const [adjustment] = await db.query(sql);
   
        // Return the merged results in the response
        return res.status(200).json({ data: adjustment });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
  
  