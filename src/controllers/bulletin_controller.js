import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db, io } from '../config/config.js'; // Import the database connection


import moment from 'moment-timezone';
import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads/');

function bulletin_websocket(data_bulletins) {
        io.emit('get_all_bulletins', data_bulletins); // Broadcast the latest bulletins to all clients
}

function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    return formattedExpirationDateTime;
}

export const create_bulletin = asyncHandler(async (req, res) => {
    const { emp_id } = req.body;

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename ? `bulletins/${filename}` : null; 

    try {
        const sql  = 'INSERT INTO bulletin (file_name, added_by, datetime_added) VALUES (?, ?, ?)';
        const sql2 = 'SELECT * FROM bulletin ORDER BY id DESC LIMIT 50'; // Adjust the order by column as needed


        const [insert_data_cluster] = await db.query(sql, [filename_insert, emp_id, storeCurrentDateTime(0, 'hours')]);
        const [data_bulletins] = await db.query(sql2);

        bulletin_websocket(data_bulletins);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Bulletin successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create bulletin.' });
    }
});

export const update_bulletin = asyncHandler(async (req, res) => {
    const { bulletin_id, emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = filename ? `bulletins/${filename}` : null; 

    try {
        const sql  = 'SELECT * FROM bulletin WHERE added_by = ? AND id = ?'; // Use a parameterized query
        const sql2 = 'UPDATE bulletin SET file_name = ? WHERE id = ?';
        const sql3 = 'SELECT * FROM bulletin ORDER BY id DESC LIMIT 50'; // Adjust the order by column as needed


        const [bulletin] = await db.query(sql, [emp_id, bulletin_id]);

        if (bulletin.length === 0) {
            return res.status(404).json({ message: 'Bulletin not found' });
        }

        const [result] = await db.query(sql2, [filename_insert || bulletin[0]['file_name'], bulletin_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Bulletin not found.' });
        }
        
        if (req.file) {
            const filePath = path.join(uploadsDir, bulletin[0]['file_name']);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }
        const [data_bulletins] = await db.query(sql3);
        bulletin_websocket(data_bulletins);

        return res.status(200).json({ success: 'Bulletin successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bulletin.' });
    }
});

export const delete_bulletin = asyncHandler(async (req, res) => {
    const { bulletin_id } = req.params; // Assuming bulletin_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM bulletin WHERE id = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM bulletin WHERE id = ?';
        const sql3 = 'SELECT * FROM bulletin ORDER BY id DESC LIMIT 50'; // Adjust the order by column as needed


        const [bulletin] = await db.query(sql, [bulletin_id]);
        const [result] = await db.query(sql2, [bulletin_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Bulletin not found.' });
        }

        const filePath = path.join(uploadsDir, bulletin[0]['file_name']);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        const [data_bulletins] = await db.query(sql3);

        bulletin_websocket(data_bulletins);

        return res.status(200).json({ success: 'Bulletin successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete bulletin.' });
    }
});

export const get_all_bulletin = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM bulletin'; // Use a parameterized query

        const [bulletin] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: bulletin });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
