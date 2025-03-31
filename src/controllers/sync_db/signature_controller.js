import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db, io } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';
import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../uploads/');


function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    return formattedExpirationDateTime;
}

export const create_signature = asyncHandler(async (req, res) => {
    const { emp_id } = req.body;

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename ? `signatures/${filename}` : null; 

    try {
        const sql  = 'INSERT INTO bulletin (signature, emp_ID, stamp) VALUES (?, ?, ?)';
        const sql2 = 'SELECT * FROM bulletin ORDER BY id DESC LIMIT 50'; // Adjust the order by column as needed


        const [insert_data_cluster] = await db.query(sql, [filename_insert, emp_id, storeCurrentDateTime(0, 'hours')]);
        const [data_bulletins] = await db.query(sql2);

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Signature successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create signature.' });
    }
});

export const update_signature = asyncHandler(async (req, res) => {
    const { signature_id, emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename ? `signatures/${filename}` : null; 

    try {
        const sql  = 'SELECT * FROM signatures WHERE emp_ID = ? AND id = ?'; // Use a parameterized query
        const sql2 = 'UPDATE signatures SET signature = ? WHERE id = ?';

        const [signature] = await db.query(sql, [emp_id, signature_id]);

        if (signature.length === 0) {
            return res.status(404).json({ message: 'Signature not found' });
        }

        const [result] = await db.query(sql2, [filename_insert || signature[0]['signature'], signature_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Signature not found.' });
        }
        
        if (req.file) {
            const filePath = path.join(uploadsDir, signature[0]['signature']);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        return res.status(200).json({ success: 'Signature successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update signature.' });
    }
});

export const delete_signature = asyncHandler(async (req, res) => {
    const { bulletin_id } = req.params; // Assuming bulletin_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM signatures WHERE id = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM signatures WHERE id = ?';

        const [signature] = await db.query(sql, [bulletin_id]);
        const [result] = await db.query(sql2, [bulletin_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Signature not found.' });
        }

        const filePath = path.join(uploadsDir, signature[0]['signature']);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        return res.status(200).json({ success: 'Signature successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete signature.' });
    }
});

export const get_all_signature = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM signatures'; // Use a parameterized query

        const [signature] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: signature });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});