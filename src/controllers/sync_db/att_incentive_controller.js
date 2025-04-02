import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db2 } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return the formatted expiration date-time
    return formattedExpirationDateTime;
}

export const get_all_att_incentive_supervisor = asyncHandler(async (req, res) => {
    const { supervisor_emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const [data_admin_login] = await db.query(sql, [supervisor_emp_id]);

        if (data_admin_login.length === 0) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
	    const placeholders = bucketArray.map(() => '?').join(', ');

        const sql2  = `SELECT att_incentives.id,
        att_incentives.emp_ID,
        att_incentives.amount, 
        att_incentives.cutoff_ID, 
        att_incentives.plotted_by,
        att_incentives.approved_by,
        att_incentives.approved_by2,
        att_incentives.status,
        att_incentives.status2,
        DATE_FORMAT(att_incentives.datetime_approved, '%Y-%m-%d %H:%i:%s') AS datetime_approved,  
        DATE_FORMAT(att_incentives.datetime_approved2, '%Y-%m-%d %H:%i:%s') AS datetime_approved2
        FROM att_incentives
        LEFT JOIN employee_profile ON att_incentives.emp_ID = employee_profile.emp_ID
        WHERE employee_profile.clusterID IN (${placeholders})
        `; // Use a parameterized query
                                  
        const [att_incentives] = await db.query(sql2, bucketArray);

        // Return the merged results in the response
        return res.status(200).json({ data: att_incentives });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});



export const create_att_incentive = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id, status, supervisor_emp_id } = req.body;

    try {
        const sql = 'INSERT INTO att_incentives (emp_ID, amount, cutoff_ID, status, plotted_by, approved_by, datetime_approved) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_att_incentive] = await db.query(sql, [emp_id, amount, cutoff_id, status, supervisor_emp_id, supervisor_emp_id, storeCurrentDateTime(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Attendance incentive successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create attendance incentive.' });
    }
});

export const update_att_incentive = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id } = req.body;
    const { att_incentive_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE att_incentives SET emp_ID = ?, amount = ?, cutoff_ID = ? WHERE id = ?`;

        const [update_data_material] = await db.query(sql, [emp_id, amount, cutoff_id, att_incentive_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Attendance incentive successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update attendance incentive.' });
    }
});


export const update_approval_att_incentive_admin = asyncHandler(async (req, res) => {
    const { status, admin_emp_id } = req.body;
    const { att_incentive_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'UPDATE att_incentives SET status2 = ?, approved_by2 = ?, datetime_approved2 = ? WHERE id = ?';
        const [update_data_bonus] = await db.query(sql, [status, admin_emp_id, storeCurrentDateTime(0, 'hours'), att_incentive_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus approval successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bonus.' });
    }
});

export const get_all_att_incentive = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, emp_ID, amount, cutoff_ID, plotted_by,
        approved_by, approved_by2, status, status2,
        DATE_FORMAT(datetime_approved, '%Y-%m-%d %H:%i:%s') AS datetime_approved,  
        DATE_FORMAT(datetime_approved2, '%Y-%m-%d %H:%i:%s') AS datetime_approved2
        FROM att_incentives`; // Use a parameterized query
                                  
        const [att_incentives] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: att_incentives });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_att_incentive = asyncHandler(async (req, res) => {
    const { att_incentive_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM att_incentives WHERE id = ?';

        const [result] = await db.query(sql, [att_incentive_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance incentive not found.' });
        }

        return res.status(200).json({ success: 'Attendance incentive successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete attendance incentive.' });
    }
});
