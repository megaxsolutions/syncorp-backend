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

export const create_coaching = asyncHandler(async (req, res) => {
    const { emp_id, coached_emp_id, coaching_type, metrix_1, metrix_2, metrix_3, metrix_4 } = req.body;

    try {
        const sql = 'INSERT INTO coaching (emp_ID, coached_by, date_coached, coaching_type, metrix_1, metrix_2, metrix_3, metrix_4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_coaching_types] = await db.query(sql, [emp_id, coached_emp_id, storeCurrentDate(0, 'hours'), coaching_type, metrix_1, metrix_2, metrix_3, metrix_4]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Coaching successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create coaching.', data: error });
    }
});

export const update_coaching = asyncHandler(async (req, res) => {
    const { emp_id, coaching_type, coached_emp_id, metrix_1, metrix_2, metrix_3, metrix_4 } = req.body;
    const { coaching_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'UPDATE coaching SET emp_ID = ?, coached_by = ?, coaching_type = ?, metrix_1 = ?, metrix_2 = ?, metrix_3 = ?, metrix_4 = ? WHERE id = ?';
        const [result] = await db.query(sql, [emp_id, coached_emp_id, coaching_type, metrix_1, metrix_2, metrix_3, metrix_4, coaching_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Coaching type not found.' });
        }

        return res.status(200).json({ success: 'Coaching type successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update coaching type.' });
    }
});

export const delete_coaching = asyncHandler(async (req, res) => {
    const { coaching_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM coaching WHERE id = ?';

        const [result] = await db.query(sql, [coaching_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Coaching not found.' });
        }

        return res.status(200).json({ success: 'Coaching successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete coaching.' });
    }
});


export const get_all_coaching = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM coaching'; // Use a parameterized query

        const [coaching] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: coaching });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const get_all_coaching_supervisor = asyncHandler(async (req, res) => {
    const { supervisor_emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter
    try {
        const sql = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const [data_admin_login] = await db.query(sql, [supervisor_emp_id]);



        if (data_admin_login.length === 0) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
	    const placeholders = bucketArray.map(() => '?').join(', ');


        const sql2  = `SELECT
        coaching.emp_ID, coaching.coached_by, 
        coaching.date_coached, 
        coaching.coaching_type, 
        coaching.metrix_1, coaching.metrix_2, 
        coaching.metrix_3, coaching.metrix_4
        FROM coaching
        LEFT JOIN employee_profile ON coaching.emp_ID = employee_profile.emp_ID
        WHERE employee_profile.clusterID IN (${placeholders})
        `; // Use a parameterized query

        const [coaching] = await db.query(sql2, bucketArray);

        // Return the merged results in the response
        return res.status(200).json({ data: coaching });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});