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

export const create_course = asyncHandler(async (req, res) => {
    const { course_title, course_details } = req.body;

    try {
        const sql = 'INSERT INTO courses (course_title, course_details, date_added) VALUES (?, ?, ?)';
        const [insert_data_course] = await db2.query(sql, [course_title, course_details, storeCurrentDateTime(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Course successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create course.' });
    }
});


export const update_course = asyncHandler(async (req, res) => {
    const { course_title, course_details } = req.body;
    const { course_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'UPDATE courses SET course_title = ?, course_details = ? WHERE id = ?';

        const [update_data_course] = await db2.query(sql, [course_title, course_details, course_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Course successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update course.' });
    }
});



export const get_all_course = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id,
        course_title,
        course_details,
        DATE_FORMAT(date_added, '%Y-%m-%d %H:%i:%s') AS date_added 
        FROM courses`; // Use a parameterized query
                                  
        const [courses] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: courses });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_course = asyncHandler(async (req, res) => {
    const { course_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM courses WHERE id = ?';

        const [result] = await db2.query(sql, [course_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        return res.status(200).json({ success: 'Course successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete course.' });
    }
});
