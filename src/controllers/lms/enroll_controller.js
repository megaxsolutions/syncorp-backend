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

export const create_enroll = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, category_id, course_id, admin_emp_id  } = req.body;


    try {
        const insertValues = [];
        let trainers_affected = 0;
        const existingSchedulesMap = new Map();

        const sqlInsert = 'INSERT INTO enroll (emp_ID, categoryID, courseID, plotted_by, datetime_enrolled) VALUES ?';
        const sqlSelect = `SELECT id, emp_ID, categoryID, courseID, plotted_by
        FROM enroll WHERE emp_ID = ? AND categoryID = ? AND courseID = ?;`;


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
                insertValues.push([emp_id, category_id, course_id, admin_emp_id,  storeCurrentDateTime(0, 'hours')]);
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
            success: `${employees_affected} enrolled employee${employees_affected >= 2 ? 's' : ''} have been added to the LMS.` 
        });        // Return the merged results in the response
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create enroll.' });
    }
});


export const get_all_enroll = asyncHandler(async (req, res) => {
    try {
        const sql = `SELECT id, emp_ID, categoryID, courseID, plotted_by,
        DATE_FORMAT(datetime_enrolled, '%Y-%m-%d %H:%i:%s') AS datetime_enrolled
        FROM enroll WHERE emp_ID = ?;`;
                                  
        const [enroll] = await db2.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: enroll });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const update_enroll = asyncHandler(async (req, res) => {
    const { emp_id, category_id, course_id  } = req.body;
    const { enroll_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `UPDATE enroll SET emp_ID = ?, categoryID = ?, courseID = ? WHERE id = ?`;

        const [update_data_trainer] = await db2.query(sql, [emp_id, category_id, course_id, enroll_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Enroll successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update enroll.' });
    }
});


export const delete_enroll = asyncHandler(async (req, res) => {
    const { enroll_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM enroll WHERE id = ?';

        const [result] = await db2.query(sql, [enroll_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enroll not found.' });
        }

        return res.status(200).json({ success: 'Enroll successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete enroll.' });
    }
});


export const check_user_enroll = asyncHandler(async (req, res) => {
    const { emp_id, category_id, course_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `SELECT id, emp_ID, categoryID, courseID, plotted_by,
        DATE_FORMAT(datetime_enrolled, '%Y-%m-%d %H:%i:%s') AS datetime_enrolled
        FROM enroll WHERE emp_ID = ? AND categoryID = ? AND courseID = ?;`;
                                  
        const [enroll] = await db2.query(sql, [emp_id, category_id, course_id]);

        if(enroll.length >= 1) {
            return res.status(200).json({ data: enroll });
        }

        return res.status(404).json({ message: 'Enrolled user not found.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
