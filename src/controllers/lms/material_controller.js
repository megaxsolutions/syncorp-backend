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

export const create_material = asyncHandler(async (req, res) => {
    const { course_id, category_id, title, filename, created_by } = req.body;

    try {
        const sql = 'INSERT INTO materials (courseID, categoryID, title, filename, date_created, created_by) VALUES (?, ?, ?, ?, ?, ?)';
        const [insert_data_material] = await db2.query(sql, [course_id, category_id, title, filename, storeCurrentDateTime(0, 'hours'), created_by]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Material successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create material.' });
    }
});

export const update_material = asyncHandler(async (req, res) => {
    const { course_id, category_id, title, filename, created_by } = req.body;
    const { material_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE materials SET courseID = ?, categoryID = ?, title = ?, filename = ?, created_by = ? WHERE id = ?`;

        const [update_data_material] = await db2.query(sql, [course_id, category_id, title, filename, created_by, material_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Course category successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update course category.' });
    }
});



export const get_all_material = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, courseID, categoryID, title, filename, created_by,
        DATE_FORMAT(date_created, '%Y-%m-%d %H:%i:%s') AS date_created
        FROM materials`; // Use a parameterized query
                                  
        const [materials] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: materials });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_material = asyncHandler(async (req, res) => {
    const { material_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM materials WHERE id = ?';

        const [result] = await db2.query(sql, [material_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Material not found.' });
        }

        return res.status(200).json({ success: 'Material successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete material.' });
    }
});
