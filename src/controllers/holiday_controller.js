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

export const create_holiday = asyncHandler(async (req, res) => {
    const { date, holiday_name, holiday_type } = req.body;

    try {
        const sql = 'INSERT INTO holidays (date, datetime_added, holiday_name, holiday_type) VALUES (?, ?, ?, ?)';
        const [insert_data_holiday] = await db.promise().query(sql, [date, storeCurrentDateTime(0, 'hours'), holiday_name, holiday_type]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Holiday successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create holiday.' });
    }
});


export const update_holiday = asyncHandler(async (req, res) => {
    const { date, holiday_name, holiday_type } = req.body;
    const { holiday_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql = 'UPDATE holidays SET date = ?, holiday_name = ?, holiday_type = ?  WHERE id = ?';        
        const [result] = await db.promise().query(sql, [date, holiday_name, holiday_type, holiday_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Holiday not found.' });
        }

        return res.status(200).json({ success: 'Holiday successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update holiday.' });
    }
});


export const get_all_holiday = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id,
        DATE_FORMAT(date, '%Y-%m-%d') AS date, 
        DATE_FORMAT(datetime_added, '%Y-%m-%d %H:%i:%s') AS datetime_added,
        holiday_name,
        holiday_type
        FROM holidays`; // Use a parameterized query



        const [holidays] = await db.promise().query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: holidays });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_holiday = asyncHandler(async (req, res) => {
    const { holiday_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM holidays WHERE id = ?';
        const [result] = await db.promise().query(sql, [holiday_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Holiday not found.' });
        }

        return res.status(200).json({ success: 'Holiday successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete holiday.' });
    }
});

  
  