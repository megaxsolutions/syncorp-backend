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

export const create_question = asyncHandler(async (req, res) => {
    const { course_id, category_id, question, selection_type, correct_answer, created_by } = req.body;

    try {
        const sql = 'INSERT INTO questions (courseID, categoryID, question, selection_type, correct_answer, date_created, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_question] = await db2.query(sql, [course_id, category_id, question, selection_type, correct_answer, storeCurrentDateTime(0, 'hours'), created_by]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Material successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create material.' });
    }
});


export const update_question = asyncHandler(async (req, res) => {
    const { course_id, category_id, question, selection_type, correct_answer, created_by } = req.body;
    const { question_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE questions SET courseID = ?, categoryID = ?, question = ?, selection_type = ?, correct_answer = ?, created_by = ? WHERE id = ?`;

        const [update_data_question] = await db2.query(sql, [course_id, category_id, question, selection_type, correct_answer, created_by, question_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Question successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update question.' });
    }
});


export const get_all_question = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, courseID, categoryID, question, selection_type, correct_answer, created_by,
        DATE_FORMAT(date_created, '%Y-%m-%d %H:%i:%s') AS date_created
        FROM questions`; // Use a parameterized query
                                  
        const [materials] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: materials });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_question = asyncHandler(async (req, res) => {
    const { question_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql = 'DELETE FROM questions WHERE id = ?';

        const [result] = await db2.query(sql, [question_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        return res.status(200).json({ success: 'Question successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete question.' });
    }
});
