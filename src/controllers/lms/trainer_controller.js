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


function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return the formatted expiration date-time
    return formattedExpirationDateTime;
}


export const create_trainer = asyncHandler(async (req, res) => {
    const { emp_id, category_id, course_id, admin_emp_id, facebook, twitter, linkedin  } = req.body;

    const filename_uploaded = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename_uploaded ? `trainers/${filename_uploaded}` : null; 
    
    try {
        const sql_insert = 'INSERT INTO trainer (emp_ID, categoryID, courseID, plotted_by, facebook, twitter, linkedin, filename_photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_trainer] = await db2.query(sql_insert, [emp_id, category_id, course_id, admin_emp_id, facebook, twitter, linkedin, filename_insert]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Trainer successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create trainer.' });
    }
});




export const get_all_trainer = asyncHandler(async (req, res) => {
    try {
        const sql = `
        SELECT 
            trainer.id, 
            trainer.emp_ID, 
            trainer.categoryID, 
            trainer.courseID, 
            trainer.plotted_by, 
            trainer.facebook, 
            trainer.twitter, 
            trainer.linkedin, 
            trainer.filename_photo,
            CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname,
            courses.course_title,
            courses.course_details,
            course_category.category_title
        FROM 
            trainer
        LEFT JOIN
            sync_db.employee_profile ON trainer.emp_ID = employee_profile.emp_ID
        LEFT JOIN
            courses ON trainer.courseID = courses.id
        LEFT JOIN
            course_category ON trainer.categoryID = course_category.id
        `;
                                  
        const [trainers] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: trainers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_user_trainer = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `
        SELECT 
            trainer.id, 
            trainer.emp_ID, 
            trainer.categoryID, 
            trainer.courseID, 
            trainer.plotted_by, 
            trainer.facebook, 
            trainer.twitter, 
            trainer.linkedin, 
            trainer.filename_photo,
            CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullname,
            courses.course_title,
            courses.course_details,
            course_category.category_title
        FROM 
            trainer
        LEFT JOIN
            sync_db.employee_profile ON trainer.emp_ID = employee_profile.emp_ID
        LEFT JOIN
            courses ON trainer.courseID = courses.id
        LEFT JOIN
            course_category ON trainer.categoryID = course_category.id
        WHERE
            trainer.emp_ID = ?`;
                                  
        const [trainers] = await db2.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: trainers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const update_trainer = asyncHandler(async (req, res) => {
    const { emp_id, category_id, course_id, facebook, twitter, linkedin  } = req.body;

    const { trainer_id } = req.params; // Assuming emp_id is passed as a URL parameter

    const filename_uploaded = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename_uploaded ? `trainers/${filename_uploaded}` : null; 

    try {
        const sql  = 'SELECT * FROM trainer WHERE id = ?'; // Use a parameterized query
        const sql2 = `UPDATE trainer SET emp_ID = ?, categoryID = ?, courseID = ?, filename_photo = ?, facebook = ?, twitter = ?, linkedin = ? WHERE id = ?`;

        const [trainer] = await db2.query(sql, [trainer_id]);
        
        if (trainer.length === 0) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        if (req.file) {
            const filePath = path.join(uploadsDir, trainer[0]['filename_photo']);
        
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }
        

        const [update_data_trainer] = await db2.query(sql2, [emp_id, category_id, course_id, filename_insert || trainer[0]['filename_photo'], facebook, twitter, linkedin, trainer_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Trainer successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update trainer.' });
    }
});


export const check_user_trainer = asyncHandler(async (req, res) => {
    const { emp_id, category_id, course_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `SELECT id, emp_ID, categoryID, courseID, plotted_by
        FROM trainer WHERE emp_ID = ? AND categoryID = ? AND courseID = ?`;

        const [trainer] = await db2.query(sql, [emp_id, category_id, course_id]);

        if(trainer.length >= 1) {
            return res.status(200).json({ data: trainer });
        }

        return res.status(404).json({ message: 'Trainer not found.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const delete_trainer = asyncHandler(async (req, res) => {
    const { trainer_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM trainer WHERE id = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM trainer WHERE id = ?';

        const [trainer] = await db2.query(sql, [trainer_id]);
        
        if (trainer.length === 0) {
            return res.status(404).json({ error: 'Material not found.' });
        }
        
        const filePath = path.join(uploadsDir, trainer[0]['filename_photo']);
        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        const [result] = await db2.query(sql2, [trainer_id]);

        return res.status(200).json({ success: 'Trainer successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete trainer.' });
    }
});
