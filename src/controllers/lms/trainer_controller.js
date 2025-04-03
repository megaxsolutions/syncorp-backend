import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db2 } from '../../config/config.js'; // Import the database connection

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

export const create_trainer = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, category_id, course_id, admin_emp_id  } = req.body;


    try {
        const insertValues = [];
        let trainers_affected = 0;
        const existingSchedulesMap = new Map();

        const sqlInsert = 'INSERT INTO trainer (emp_ID, categoryID, courseID, plotted_by) VALUES ?';
        const sqlSelect = `SELECT id, emp_ID, categoryID, courseID, plotted_by
        FROM trainer WHERE emp_ID = ? AND categoryID = ? AND courseID = ?;`;


        const lms_trainers = await Promise.all(
            array_employee_emp_id.map(async (emp_id) => {
                const [result] = await db2.query(sqlSelect, [emp_id, category_id, course_id]);
                return result;
            })
        );


        lms_trainers.flat().forEach(user => {
            const key = `${user.emp_ID}`;
            existingSchedulesMap.set(key, true);
        });

         // Loop through each employee and day to prepare the insertion data
         for (const emp_id of array_employee_emp_id) {
            let count_trainers = 0;
            const key = `${emp_id}`;

            // Check if the (emp_id, day) combination is already in the map (i.e., the shift exists)
            if (!existingSchedulesMap.has(key)) {
                insertValues.push([emp_id, category_id, course_id, admin_emp_id]);
                ++count_trainers;
            }

            // If at least one schedule was added for this employee, increment the affected count
            if (count_trainers > 0) {
                trainers_affected++;
            }
        }


        // If there are any values to insert, perform a batch insert
        if (insertValues.length > 0) {
            await db2.query(sqlInsert, [insertValues]);
        }

        return res.status(200).json({ 
            success: `${employees_affected} trainer${employees_affected >= 2 ? 's' : ''} have been added to the LMS.` 
        });        // Return the merged results in the response
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create trainer.' });
    }
});

export const get_all_trainer = asyncHandler(async (req, res) => {
    try {
        const sql = `SELECT id, emp_ID, categoryID, courseID, plotted_by
        FROM trainer WHERE emp_ID = ?;`;
                                  
        const [trainers] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: trainers });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const update_trainer = asyncHandler(async (req, res) => {
    const { emp_id, category_id, course_id, admin_emp_id  } = req.body;
    const { trainer_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE trainer SET emp_ID = ?, categoryID = ?, courseID = ? WHERE id = ?`;

        const [update_data_trainer] = await db2.query(sql, [emp_id, category_id, course_id, trainer_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Trainer successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update trainer.' });
    }
});


export const check_user_trainer = asyncHandler(async (req, res) => {
    const { emp_id, category_id, course_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `SELECT id, emp_ID, categoryID, courseID, plotted_by
        FROM trainer WHERE emp_ID = ? AND categoryID = ? AND courseID = ?;`;

        const [trainer] = await db2.query(sql, [emp_id, category_id, course_id]);

        if(trainer.length >= 1) {
            return res.status(200).json({ data: trainer });
        }

        return res.status(404).json({ message: 'Trainer not found.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const delete_trainer = asyncHandler(async (req, res) => {
    const { trainer_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM trainer WHERE id = ?';

        const [result] = await db2.query(sql, [trainer_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Trainer not found.' });
        }

        return res.status(200).json({ success: 'Trainer successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete trainer.' });
    }
});
