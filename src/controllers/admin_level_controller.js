import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';



function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
 
}

export const create_admin_level = asyncHandler(async (req, res) => {
    const { admin_level } = req.body;

    try {
        const sql  = 'INSERT INTO admin_level (level) VALUES (?)';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';

        const [insert_data_site] = await db.query(sql, [admin_level]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);
   

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['New admin level added: ' + admin_level, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        return res.status(200).json({ success: 'Admin level successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create admin level.', data : error});
    }
});


export const update_admin_level = asyncHandler(async (req, res) => {
    const { admin_level } = req.body;
    const { admin_level_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql  = 'SELECT * FROM admin_level WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'UPDATE admin_level SET level = ? WHERE id = ?';

        const [data_admin_level] = await db.query(sql, [admin_level_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_admin_level.length === 0) {
            return res.status(404).json({ error: 'Admin level not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Admin level updated from: ' + data_admin_level[0]['level'] + ' to: ' + admin_level, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        const [result] = await db.query(sql4, [admin_level, admin_level_id]);
    
        return res.status(200).json({ success: 'Admin level successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update admin level.' });
    }
});



export const delete_admin_level = asyncHandler(async (req, res) => {
    const { admin_level_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM admin_login WHERE user_level = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM admin_level WHERE id = ?';


        const [data_admin_login] = await db.query(sql, [admin_level_id]);

        if(data_admin_login.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_admin_login.length == 1 ? `${ data_admin_login.length } row has` : `${ data_admin_login.length } rows have` } been affected.` });
        }

        if(data_admin_login.length == 0) {
            const [result] = await db.query(sql2, [admin_level_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Admin level not found.' });
            }

            return res.status(200).json({ success: 'Admin level successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete admin level.' });
    }
});

  
  