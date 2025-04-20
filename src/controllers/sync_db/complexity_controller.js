import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

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

export const get_all_complexity_supervisor = asyncHandler(async (req, res) => {
    const { supervisor_emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const [data_admin_login] = await db.query(sql, [supervisor_emp_id]);

        if (data_admin_login.length === 0) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
	    const placeholders = bucketArray.map(() => '?').join(', ');

        const sql2  = `SELECT complexity.id,
        complexity.emp_ID,
        complexity.amount, 
        complexity.cutoff_ID, 
        complexity.plotted_by,
        complexity.approved_by,
        complexity.approved_by2,
        complexity.status,
        complexity.status2,
        CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname,
        DATE_FORMAT(complexity.datetime_approved, '%Y-%m-%d %H:%i:%s') AS datetime_approved,  
        DATE_FORMAT(complexity.datetime_approved2, '%Y-%m-%d %H:%i:%s') AS datetime_approved2
        FROM complexity
        LEFT JOIN employee_profile ON complexity.emp_ID = employee_profile.emp_ID
        WHERE employee_profile.clusterID IN (${placeholders}) 
        ORDER BY complexity.id ASC`; // Use a parameterized query
                                  
        const [complexity] = await db.query(sql2, bucketArray);

        // Return the merged results in the response
        return res.status(200).json({ data: complexity });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const create_complexity = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id, status, supervisor_emp_id } = req.body;

    try {
        const sql = 'INSERT INTO complexity (emp_ID, amount, cutoff_ID, status, plotted_by, approved_by, datetime_approved) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_att_incentive] = await db.query(sql, [emp_id, amount, cutoff_id, status, supervisor_emp_id, supervisor_emp_id, storeCurrentDateTime(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Complexity successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create complexity.' });
    }
});

export const update_complexity = asyncHandler(async (req, res) => {
    const { emp_id, amount, cutoff_id } = req.body;
    const { complexity_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE complexity SET emp_ID = ?, amount = ?, cutoff_ID = ? WHERE id = ?`;

        const [update_data_material] = await db.query(sql, [emp_id, amount, cutoff_id, complexity_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Complexity successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update complexity.' });
    }
});



export const get_all_complexity = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT complexity.id, complexity.emp_ID, complexity.amount, complexity.cutoff_ID, complexity.plotted_by,
        complexity.approved_by, complexity.approved_by2, complexity.status, complexity.status2,
        DATE_FORMAT(complexity.datetime_approved, '%Y-%m-%d %H:%i:%s') AS datetime_approved,  
        DATE_FORMAT(complexity.datetime_approved2, '%Y-%m-%d %H:%i:%s') AS datetime_approved2,
        CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname
        FROM complexity
        LEFT JOIN employee_profile ON complexity.emp_ID = employee_profile.emp_ID
        ORDER BY complexity.id ASC`; // Use a parameterized query

        

                                  
        const [complexity] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: complexity });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const update_approval_complexity_admin = asyncHandler(async (req, res) => {
    const { status, admin_emp_id } = req.body;
    const { complexity_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'UPDATE complexity SET status2 = ?, approved_by2 = ?, datetime_approved2 = ? WHERE id = ?';
        const [update_data_bonus] = await db.query(sql, [status, admin_emp_id, storeCurrentDateTime(0, 'hours'), complexity_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus approval successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bonus.' });
    }
});


export const delete_complexity = asyncHandler(async (req, res) => {
    const { complexity_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM complexity WHERE id = ?';

        const [result] = await db.query(sql, [complexity_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Complexitynot found.' });
        }

        return res.status(200).json({ success: 'Complexity successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete complexity.' });
    }
});
