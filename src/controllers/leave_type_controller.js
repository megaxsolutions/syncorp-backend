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

export const create_leave_type = asyncHandler(async (req, res) => {
    const { leave_type } = req.body;

    try {
        const sql = 'INSERT INTO leave_type (type) VALUES (?)';
        const [insert_data_leave_type] = await db.promise().query(sql, [leave_type]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave type successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create leave type.' });
    }
});


export const update_leave_type = asyncHandler(async (req, res) => {
    const { leave_type } = req.body;
    const { leave_type_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql = 'UPDATE leave_type SET type = ? WHERE id = ?';
        const [update_data_leave_type] = await db.promise().query(sql, [leave_type, leave_type_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave type successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave type.' });
    }
});



export const get_all_leave_type = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM leave_type'; // Use a parameterized query

        const [leave_type] = await db.promise().query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: leave_type });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const delete_leave_type = asyncHandler(async (req, res) => {
    const { leave_type_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM leave_type WHERE id = ?';
        const [result] = await db.promise().query(sql, [leave_type_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Leave type not found.' });
        }

        return res.status(200).json({ success: 'Leave type successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete leave type.' });
    }
});


