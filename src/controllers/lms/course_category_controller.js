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

export const create_course_category = asyncHandler(async (req, res) => {
    const { category_title } = req.body;

    try {
        const sql = 'INSERT INTO course_category (category_title, date_added) VALUES (?, ?)';
        const [insert_data_course_category] = await db2.query(sql, [category_title, storeCurrentDateTime(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Course category successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create course category.' });
    }
});


export const update_course_category = asyncHandler(async (req, res) => {
    const { category_title } = req.body;
    const { course_category_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'UPDATE course_category SET category_title = ? WHERE id = ?';

        const [update_data_course_category] = await db2.query(sql, [category_title, course_category_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Course category successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update course category.' });
    }
});



export const get_all_course_category = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id,
        category_title,
        DATE_FORMAT(date_added, '%Y-%m-%d %H:%i:%s') AS date_added 
        FROM course_category`; // Use a parameterized query
                                  
        const [course_category] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: course_category });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});



export const delete_course_category = asyncHandler(async (req, res) => {
    const { course_category_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM course_category WHERE id = ?';

        const [result] = await db2.query(sql, [course_category_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course category not found.' });
        }

        return res.status(200).json({ success: 'Course category successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete course category.' });
    }
});
