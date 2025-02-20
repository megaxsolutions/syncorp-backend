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

export const create_overtime_request = asyncHandler(async (req, res) => {
    const { ot_type, hrs, emp_ID} = req.body;

    try {
        const sql = 'INSERT INTO overtime_request (date, hrs, ot_type, emp_ID, status) VALUES (?, ?, ?, ?, ?)';
        const [insert_data_overtime_request] = await db.promise().query(sql, [storeCurrentDate(0, 'hours'), hrs, ot_type, emp_ID, 'pending']);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Overtime request successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create overtime request .' });
    }
});


export const update_user_overtime_request  = asyncHandler(async (req, res) => {
    const { ot_type, hrs} = req.body;
    const { overtime_request_id } = req.params; // Assuming department_id is passed as a URL parameter
 

    try {
        const sql = 'UPDATE overtime_request SET ot_type = ?, hrs = ? WHERE id = ?';
        
        const [update_data_overtime_request] = await db.promise().query(sql, [ot_type, hrs, overtime_request_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Overtime request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update overtime request.' });
    }
});



export const update_approval_overtime_request = asyncHandler(async (req, res) => {
    const { emp_id_approved_by } = req.body;
    const { overtime_request_id } = req.params; // Assuming department_id is passed as a URL parameter


    
    try {
        const sql  = 'UPDATE overtime_request SET approved_by = ?, date_approved = ?, status = ? WHERE id = ?';

        const [update_data_overtime_request] = await db.promise().query(sql, [emp_id_approved_by, storeCurrentDate(0, 'hours'), 'approved', overtime_request_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Overtime request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update overtime request.' });
    }
});

export const update_status_overtime_request = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { overtime_request_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql  = 'UPDATE overtime_request SET status = ? WHERE id = ?';

        const [update_data_overtime_request] = await db.promise().query(sql, [status, overtime_request_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Overtime request successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update overtime request.' });
    }
});


export const get_all_user_overtime_request = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = `SELECT 
        id,
        DATE_FORMAT(date, '%Y-%m-%d') AS date, 
        hrs, ot_type, emp_ID, approved_by, 
        DATE_FORMAT(date_approved, '%Y-%m-%d') AS date_approved, 
        status FROM overtime_request WHERE emp_ID = ?`; // Use a parameterized query

        const [overtime_request] = await db.promise().query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: overtime_request });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const get_all_overtime_request = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT 
        id,
        DATE_FORMAT(date, '%Y-%m-%d') AS date, 
        hrs, ot_type, emp_ID, approved_by, 
        DATE_FORMAT(date_approved, '%Y-%m-%d') AS date_approved, 
        status FROM overtime_request`; // Use a parameterized query

        const [overtime_request] = await db.promise().query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: overtime_request });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});



export const delete_overtime_request = asyncHandler(async (req, res) => {
    const { overtime_request_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM overtime_request WHERE id = ?';
        const [result] = await db.promise().query(sql, [overtime_request_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Overtime request not found.' });
        }

        return res.status(200).json({ success: 'Overtime request successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete overtime request.' });
    }
});

