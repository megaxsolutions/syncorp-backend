import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';



// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedCurrentDateTime = currentDateTime.format('YYYY-MM-DD HH:mm:ss');
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
    // return {
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}

// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedCurrentDateTime = currentDateTime.format('YYYY-MM-DD');
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
    // return {
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}

export const create_leave_request = asyncHandler(async (req, res) => {
    const { leave_type, emp_ID, details} = req.body;
    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = `leave_requests/${filename}`; 

    try {
        const sql = 'INSERT INTO leave_request (date, leave_type, emp_ID, details, file_uploaded) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_leave_request] = await db.promise().query(sql, [storeCurrentDate(0, 'hours'), leave_type, emp_ID, details, filename_insert]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave request successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create leave request .' });
    }
});


export const update_user_leave_request = asyncHandler(async (req, res) => {
    const { leave_type, details} = req.body;
    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = `leave_request/${filename}`; 
    const { leave_request_id } = req.params; // Assuming department_id is passed as a URL parameter


    
    try {
        const sql  = 'SELECT * FROM leave_request WHERE id = ?'; // Use a parameterized query
        const sql2 = 'UPDATE leave_request SET leave_type = ?, details = ?, file_uploaded = ? WHERE id = ?';
        
        const [leave_request] = await db.promise().query(sql, [leave_request_id]);
        const [update_data_leave_request] = await db.promise().query(sql2, [leave_type, details, req.file ? filename_insert : leave_request[0]['file_uploaded'], leave_request_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave request.' });
    }
});



export const update_approval_leave_request = asyncHandler(async (req, res) => {
    const { emp_id_approved_by} = req.body;
    const { leave_request_id } = req.params; // Assuming department_id is passed as a URL parameter


    
    try {
        const sql  = 'UPDATE leave_request SET approved_by = ?, date_approved = ? WHERE id = ?';

        const [update_data_leave_request] = await db.promise().query(sql, [emp_id_approved_by, storeCurrentDate(0, 'hours'), leave_request_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave request.' });
    }
});

export const update_status_leave_request = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { leave_request_id } = req.params; // Assuming department_id is passed as a URL parameter
    

    try {
        const sql  = 'UPDATE leave_request SET status = ? WHERE id = ?';

        const [update_data_leave_request] = await db.promise().query(sql, [status, leave_request_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave request.' });
    }
});


export const get_all_leave_request = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = `SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') AS date, 
        leave_type, emp_ID, approved_by, 
        DATE_FORMAT(date_approved, '%Y-%m-%d') AS date_approved,
        status, details, file_uploaded
        FROM leave_request WHERE emp_ID = ?`; // Use a parameterized query

 
        const [leave_request] = await db.promise().query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: leave_request });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_leave_request = asyncHandler(async (req, res) => {
    const { leave_request_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM leave_request WHERE id = ?';
        const [result] = await db.promise().query(sql, [leave_request_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Leave request not found.' });
        }

        return res.status(200).json({ success: 'Leave request successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete leave request.' });
    }
});

