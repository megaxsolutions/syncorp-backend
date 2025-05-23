import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db2, db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

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

export const create_user = asyncHandler(async (req, res) => {
    const { array_employee_emp_id  } = req.body;


    try {
        const insertValues = [];
        let users_affected = 0;
        const existingSchedulesMap = new Map();

        const sqlInsert = 'INSERT INTO users (emp_ID, date_created) VALUES ?';
        const sqlSelect = `SELECT id, emp_ID, 
        DATE_FORMAT(date_created, '%Y-%m-%d') AS date_created
        FROM users WHERE emp_ID = ?;`;


        const lms_users = await Promise.all(
            array_employee_emp_id.map(async (emp_id) => {
                const [result] = await db2.query(sqlSelect, [emp_id]);
                return result;
            })
        );


        lms_users.flat().forEach(user => {
            const key = `${user.emp_ID}`;
            existingSchedulesMap.set(key, true);
        });

         // Loop through each employee and day to prepare the insertion data
         for (const emp_id of array_employee_emp_id) {
            let count_users = 0;
            const key = `${emp_id}`;

            // Check if the (emp_id, day) combination is already in the map (i.e., the shift exists)
            if (!existingSchedulesMap.has(key)) {
                insertValues.push([emp_id, storeCurrentDate(0, 'hours')]);
                ++count_users;
            }

            // If at least one schedule was added for this employee, increment the affected count
            if (count_users > 0) {
                users_affected++;
            }
        }


        // If there are any values to insert, perform a batch insert
        if (insertValues.length > 0) {
            await db2.query(sqlInsert, [insertValues]);
        }

        return res.status(200).json({ 
            success: `${users_affected} user${users_affected >= 2 ? 's' : ''} have been added to the LMS.` 
        });        // Return the merged results in the response
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create user.' });
    }
});


export const get_all_user = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id, emp_ID, 
        DATE_FORMAT(date_created, '%Y-%m-%d') AS date_created
        FROM users`; // Use a parameterized query
                                  
        const [users] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const check_user = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = `SELECT id, emp_ID, 
        DATE_FORMAT(date_created, '%Y-%m-%d') AS date_created
        FROM users WHERE emp_ID = ?`; // Use a parameterized query
                                  
        const [users] = await db2.query(sql, [emp_id]);

        if(users.length >= 1) {
            return res.status(200).json({ data: users });
        }

        return res.status(404).json({ message: 'User  not found.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const delete_user = asyncHandler(async (req, res) => {
    const { user_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `DELETE FROM users WHERE id = ?`;
   
        const [result] = await db2.query(sql, [user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
    
        return res.status(200).json({ success: 'User successfully deleted.' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to delete user.' });
    }
});


export const delete_multiple_user = asyncHandler(async (req, res) => {
    const { array_employee_emp_id } = req.body;

    try {
        const sqlDelete = `DELETE FROM users WHERE emp_ID = ?`;
        let users_affected = 0;

        const delete_lms_users = await Promise.all(
            array_employee_emp_id.map(async (emp_id) => {
                const [result] = await db2.query(sqlDelete, [emp_id]);
                if(result.affectedRows > 0) {
                    users_affected++;
                }
                return result;
            })
        );

        return res.status(200).json({ 
            success: `${users_affected} user${users_affected >= 2 ? 's' : ''} have been removed to the LMS.` 
        });  
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to delete user.' });
    }
});


