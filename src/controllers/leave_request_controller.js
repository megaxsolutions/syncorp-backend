import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';
import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads/');

// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD HH:mm:ss');
}

// Function to get the current date in Asia/Manila
function storeCurrentDate(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD');
}

export const create_leave_request = asyncHandler(async (req, res) => {
    const { leave_type, emp_ID, details } = req.body;
    const { leave_type_id } = req.params; // Assuming leave_type_id is passed as a URL parameter

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = `leave_requests/${filename}`; 
    
    if (leave_type_id == 3 && !req.file) {
        return res.status(400).json({ error: 'Image file is required.' });
    }

    try {
        const sql = 'INSERT INTO leave_request (date, leave_type, emp_ID, details, file_uploaded, status) VALUES (?, ?, ?, ?, ?, ?)';
        const [insert_data_leave_request] = await db.query(sql, [storeCurrentDate(0, 'hours'), leave_type, emp_ID, details, req.file ? filename_insert : null, 'pending']);
      
        return res.status(200).json({ success: 'Leave request successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create leave request.' });
    }
});

export const update_user_leave_request = asyncHandler(async (req, res) => {
    const { leave_type, details } = req.body;
    const { leave_request_id, leave_type_id } = req.params; // Assuming leave_request_id and leave_type_id are passed as URL parameters

    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = `leave_requests/${filename}`; 
    
    if (leave_type_id == 3 && !req.file) {
        return res.status(400).json({ error: 'Image file is required.' });
    }

    try {
        const sql = 'SELECT * FROM leave_request WHERE id = ?'; // Use a parameterized query
        const sql2 = 'UPDATE leave_request SET leave_type = ?, details = ?, file_uploaded = ? WHERE id = ?';
        
        const [leave_request] = await db.query(sql, [leave_request_id]);
        const [update_data_leave_request] = await db.query(sql2, [leave_type, details, req.file ? filename_insert : leave_request[0]['file_uploaded'], leave_request_id]);

        if (req.file) {
            const filePath = path.join(uploadsDir, leave_request[0]['file_uploaded']);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        return res.status(200).json({ success: 'Leave request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave request.' });
    }
});

export const update_approval_leave_request = asyncHandler(async (req, res) => {
    const { emp_id_approved_by, status } = req.body;
    const { leave_request_id } = req.params; // Assuming leave_request_id is passed as a URL parameter

    try {
        const sql = 'UPDATE leave_request SET approved_by = ?, date_approved = ?, status = ? WHERE id = ?';
        const [update_data_leave_request] = await db.query(sql, [emp_id_approved_by, storeCurrentDate(0, 'hours'), status, leave_request_id]);
      
        return res.status(200).json({ success: 'Leave request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave request.' });
    }
});


export const update_approval_leave_request_admin = asyncHandler(async (req, res) => {
    const { emp_id_approved_by, status } = req.body;
    const { leave_request_id } = req.params; // Assuming leave_request_id is passed as a URL parameter

    try {
        const sql = 'UPDATE leave_request SET approved_by2 = ?, date_approved_by2 = ?, status2 = ? WHERE id = ?';
        const [update_data_leave_request] = await db.query(sql, [emp_id_approved_by, storeCurrentDate(0, 'hours'), status, leave_request_id]);
      
        return res.status(200).json({ success: 'Leave request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave request.' });
    }
});



export const get_all_leave_request = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `SELECT id,
            DATE_FORMAT(date, '%Y-%m-%d') AS date, 
            leave_type, emp_ID, approved_by, 
            DATE_FORMAT(date_approved, '%Y-%m-%d') AS date_approved,
            status, details, file_uploaded
            FROM leave_request ORDER BY id DESC`; // Use a parameterized query

        const [leave_request] = await db.query(sql, [emp_id]);

        return res.status(200).json({ data: leave_request });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const get_all_user_leave_request = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `SELECT id,
            DATE_FORMAT(date, '%Y-%m-%d') AS date, 
            leave_type, emp_ID, approved_by, 
            DATE_FORMAT(date_approved, '%Y-%m-%d') AS date_approved,
            status, details, file_uploaded
            FROM leave_request WHERE emp_ID = ?`; // Use a parameterized query

        const [leave_request] = await db.query(sql, [emp_id]);

        return res.status(200).json({ data: leave_request });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const delete_leave_request = asyncHandler(async (req, res) => {
    const { leave_request_id } = req.params; // Assuming leave_request_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM leave_request WHERE id = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM leave_request WHERE id = ?';

        const [leave_request] = await db.query(sql, [leave_request_id]);
        const [result] = await db.query(sql2, [leave_request_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Leave request not found.' });
        }

        const filePath = path.join(uploadsDir, leave_request[0]['file_uploaded']);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        return res.status(200).json({ success: 'Leave request successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete leave request.' });
    }
});