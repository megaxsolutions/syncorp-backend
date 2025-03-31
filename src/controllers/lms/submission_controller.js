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

export const create_submission = asyncHandler(async (req, res) => {
    const { course_id, category_id, emp_id, question_id, answer, correct_answer } = req.body;

    try {
        const sql = 'INSERT INTO submissions (courseID, categoryID, emp_ID, questionID, answer, correct_answer, datetime_submitted) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_submission] = await db.query(sql, [course_id, category_id, emp_id, question_id, answer, correct_answer, storeCurrentDateTime(0, 'hours')]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Submission successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create submission.' });
    }
});


export const update_submission = asyncHandler(async (req, res) => {
    const { course_id, category_id, question_id, answer, correct_answer } = req.body;
    const { submission_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE submissions SET courseID = ?, categoryID = ?, questionID = ?, answer = ?, correct_answer = ? WHERE id = ?`;

        const [update_data_submission] = await db.query(sql, [course_id, category_id, question_id, answer, correct_answer, submission_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Submission successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update submission.' });
    }
});




export const get_all_submission = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, courseID, categoryID, emp_ID, questionID, answer, correct_answer,
        DATE_FORMAT(datetime_submitted, '%Y-%m-%d %H:%i:%s') AS datetime_submitted
        FROM submissions`; // Use a parameterized query
                                  
        const [submission] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: submission });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_submission = asyncHandler(async (req, res) => {
    const { submission_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM submissions WHERE id = ?';

        const [result] = await db.query(sql, [submission_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Submission not found.' });
        }

        return res.status(200).json({ success: 'Submission successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete submission.' });
    }
});
