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

export const create_material = asyncHandler(async (req, res) => {
    const { course_id, category_id, title, filename, created_by } = req.body;

    const filename_uploaded = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename_uploaded ? `materials/${filename_uploaded}` : null; 

    try {
        const sql = 'INSERT INTO materials (courseID, categoryID, title, filename, date_created, created_by, filename_uploaded) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [insert_data_material] = await db2.query(sql, [course_id, category_id, title, filename, storeCurrentDateTime(0, 'hours'), created_by, filename_insert]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Material successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create material.' });
    }
});

export const update_material = asyncHandler(async (req, res) => {
    const { course_id, category_id, title, filename, created_by } = req.body;
    const { material_id } = req.params; // Assuming emp_id is passed as a URL parameter

    const filename_uploaded = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename_uploaded ? `materials/${filename_uploaded}` : null; 

    try {
        const sql  = 'SELECT * FROM materials WHERE id = ?'; // Use a parameterized query
        const sql2 = `UPDATE materials SET courseID = ?, categoryID = ?, title = ?, filename = ?, created_by = ?, filename_uploaded = ? WHERE id = ?`;

        const [material] = await db2.query(sql, [material_id]);

        if (material.length === 0) {
            return res.status(404).json({ message: 'Material not found' });
        }

        if (req.file) {
            const filePath = path.join(uploadsDir, material[0]['filename_uploaded']);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }
        
        const [update_data_material] = await db2.query(sql2, [course_id, category_id, title, filename, created_by, filename_insert || material[0]['filename_uploaded'], material_id]);
        
        if (update_data_material.affectedRows === 0) {
            return res.status(404).json({ error: 'Material not found.' });
        }
        // Return the merged results in the response
        return res.status(200).json({ success: 'Material successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update material.' });
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
        const sql  = 'SELECT * FROM materials WHERE id = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM materials WHERE id = ?';

        const [material] = await db2.query(sql, [material_id]);

        if (material.length === 0) {
            return res.status(404).json({ error: 'Material not found.' });
        }

        const filePath = path.join(uploadsDir, material[0]['filename_uploaded']);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });
        const [result] = await db2.query(sql2, [material_id]);


        return res.status(200).json({ success: 'Material successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete material.' });
    }
});
