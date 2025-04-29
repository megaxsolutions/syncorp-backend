import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db2 } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../uploads/');


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
    const { course_title, course_details, category_id } = req.body;

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename ? `courses/${filename}` : null; 

    try {
        const sql = 'INSERT INTO courses (course_title, course_details, date_added, filename, categoryID) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_course] = await db2.query(sql, [course_title, course_details, storeCurrentDateTime(0, 'hours'), filename_insert, category_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Course successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create course.' });
    }
});


export const update_course = asyncHandler(async (req, res) => {
    const { course_title, course_details, category_id } = req.body;
    const { course_id } = req.params; // Assuming emp_id is passed as a URL parameter

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename ? `courses/${filename}` : null; 

    try {
        const sql  = 'SELECT * FROM courses WHERE id = ?'; // Use a parameterized query
        const sql2 = 'UPDATE courses SET course_title = ?, course_details = ?, categoryID = ?, filename = ? WHERE id = ?';

        const [course] = await db2.query(sql, [course_id]);

        if (course.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.file) {
            const filePath = path.join(uploadsDir, course[0]['filename']);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        const [update_data_course] = await db2.query(sql2, [course_title, course_details, category_id, filename_insert || course[0]['filename'], course_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Course successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update course.' });
    }
});



export const get_all_course = asyncHandler(async (req, res) => {
    try {
        const sql  = `
        SELECT courses.id,
            courses.course_title,
            courses.course_details,
            DATE_FORMAT(courses.date_added, '%Y-%m-%d %H:%i:%s') AS date_added,
            courses.filename,
            courses.categoryID,
            course_category.category_title,
            count(ratings.id) AS total_rating,
            IFNULL(ROUND(AVG(ratings.rating), 1), 0) AS average_rating
        FROM 
            courses
        LEFT JOIN 
            ratings ON courses.id = ratings.courseID
        LEFT JOIN 
            course_category ON courses.categoryID = course_category.id
        GROUP BY 
            courses.id
        `; // Use a parameterized query
                                  
        const [courses] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: courses });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});



export const get_specific_course = asyncHandler(async (req, res) => {
    const { course_id } = req.params; // Assuming emp_id is passed as a URL parameter
    
    try {
        const sql  = `
        SELECT 
            courses.id,
            courses.course_title,
            courses.course_details,
            DATE_FORMAT(courses.date_added, '%Y-%m-%d %H:%i:%s') AS date_added,
            courses.filename,
            courses.categoryID,
            course_category.category_title,
            count(ratings.id) AS total_rating,
            IFNULL(ROUND(AVG(ratings.rating), 1), 0) AS average_rating
        FROM 
            courses
        LEFT JOIN 
            ratings ON courses.id = ratings.courseID
        LEFT JOIN 
            course_category ON courses.categoryID = course_category.id
        WHERE 
            courses.id = ?
        GROUP BY 
            courses.id
        `; // Use a parameterized query
                                  
        const [courses] = await db2.query(sql, [course_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: courses });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_course = asyncHandler(async (req, res) => {
    const { course_id } = req.params; // Assuming emp_id is passed as a URL parameter


    try {
        const sql  = 'SELECT * FROM courses WHERE id = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM courses WHERE id = ?';

        const [course] = await db2.query(sql, [course_id]);

        
        if (course.length === 0) {
            return res.status(404).json({ error: 'Couurse not found.' });
        }

        const filePath = path.join(uploadsDir, course[0]['filename']);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        const [result] = await db2.query(sql2, [course_id]);


        return res.status(200).json({ success: 'Course successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete course.' });
    }
});
