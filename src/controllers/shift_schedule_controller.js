import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';
import { Worker } from 'worker_threads';



function storeCurrentDate(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD');
}

function getCurrentWeekdays() {
    const weekdays = [];
    const today = moment.tz('Asia/Manila'); // Get current date in Asia/Manila timezone

    // Declare startOfWeek variable
    let startOfWeek;

    // Check if today is Saturday (6) or Sunday (0)
    if (today.day() === 6 || today.day() === 0) {
        // If today is Saturday or Sunday, start from next Monday
        startOfWeek = today.clone().add(1, 'weeks').startOf('isoWeek'); // Move to next week's Monday
    } else {
        // If today is a weekday, start from the current week's Monday
        startOfWeek = today.clone().startOf('isoWeek');
    }

    // Loop through the week (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        const weekday = startOfWeek.clone().add(i, 'days');
        // Format the date as "YYYY-MM-DD"
        weekdays.push(weekday.format('YYYY-MM-DD')); // You can append time if needed
    }

    return weekdays;
}


function getCurrentWeekdays1() {
    const weekdays = [];
    const today = moment.tz('Asia/Manila'); // Get current date in Asia/Manila timezone

    // Get the start of the week (Monday)
    const startOfWeek = today.clone().startOf('isoWeek');

    // Loop through the week (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        const weekday = startOfWeek.clone().add(i, 'days');
        // Format the date as "YYYY-MM-DD HH:mm:ss"
        weekdays.push(weekday.format('YYYY-MM-DD')); // Assuming you want a fixed time of 17:00:00
    }

    return weekdays;
}



// Function to get weekdays of the current month
function getCurrentMonthWeekdays() {
    const weekdays = [];
    const today = moment.tz('Asia/Manila'); // Get current date in Asia/Manila timezone

    // Get the start and end of the current month
    const startOfMonth = today.clone().startOf('month');
    const endOfMonth = today.clone().endOf('month');

    // Loop through each day of the month
    for (let day = startOfMonth.clone(); day.isBefore(endOfMonth.clone().add(1, 'days')); day.add(1, 'days')) {
        // Check if the day is a weekday (Monday to Friday)
        if (day.day() !== 0 && day.day() !== 6) { // 0 = Sunday, 6 = Saturday
            weekdays.push(day.format('YYYY-MM-DD')); // Store in the desired format
        }
    }

    return weekdays;
}



export const create_shift_schedule_current_day = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlInsert = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES ?';
        const sqlSelect = 'SELECT * FROM shift_schedule WHERE emp_ID = ? AND day = ?';

        const weekdays = getCurrentWeekdays();

        // Prepare data for batch insertion
        const insertValues = [];
        let employees_affected = 0;

        for (const emp_id of array_employee_emp_id) {
            let count_employees = 0;

            // Check if the schedule for this employee and day already exists
            const [shift_schedule] = await db.query(sqlSelect, [emp_id, storeCurrentDate(0, 'hours')]);

            if (shift_schedule.length === 0) {
                insertValues.push([emp_id, shift_in, shift_out, storeCurrentDate(0, 'hours'), admin_emp_id]);
                count_employees++;
            }
            

            // If at least one schedule was added for this employee, increment the affected count
            if (count_employees >= 1) {
                employees_affected++;
            }
        }
        // Perform batch insert if there are new records to insert
        if (insertValues.length > 0) {
            await db.query(sqlInsert, [insertValues]);
        }

        const [users] = await db.query(sql);

        if(users.length == array_employee_emp_id.length) {
            return res.status(200).json({ success: 'Shift schedule for all employees has been updated.' });
        }

        return res.status(200).json({ success: `Shift schedule for ${employees_affected} employees has been updated.` });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update shift schedule.' });
    }
});




export const create_shift_schedule_current_weekday = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlInsert = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES ?';
        const sqlSelect = 'SELECT * FROM shift_schedule WHERE emp_ID = ? AND day = ?';

        const weekdays = getCurrentWeekdays();

        // Prepare data for batch insertion
        const insertValues = [];
        let employees_affected = 0;

        for (const emp_id of array_employee_emp_id) {
            let count_employees = 0;

            for (const day of weekdays) {
                // Check if the schedule for this employee and day already exists
                const [shift_schedule] = await db.query(sqlSelect, [emp_id, day]);

                if (shift_schedule.length === 0) {
                    insertValues.push([emp_id, shift_in, shift_out, day, admin_emp_id]);
                    count_employees++;
                }
            }

            // If at least one schedule was added for this employee, increment the affected count
            if (count_employees > 0) {
                employees_affected++;
            }
        }
        // Perform batch insert if there are new records to insert
        if (insertValues.length > 0) {
            await db.query(sqlInsert, [insertValues]);
        }

        const [users] = await db.query(sql);

        if(users.length == array_employee_emp_id.length) {
            return res.status(200).json({ success: 'Shift schedule for all employees has been updated.' });
        }

        return res.status(200).json({ success: `Shift schedule for ${employees_affected} employees has been updated.` });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update shift schedule.' });
    }
});

export const create_shift_schedule_current_month_weekday = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlInsert = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES ?';

        // Fix for the SQL query with the IN clause:
        const sqlSelect = `SELECT emp_ID, DATE_FORMAT(day, '%Y-%m-%d') AS day FROM shift_schedule WHERE emp_ID = ? AND day IN (?)`;

        // Fetch all the existing shift schedules for the current employees and weekdays in one go
        const weekdays = getCurrentMonthWeekdays();

        // Prepare data for batch insertion
        const insertValues = [];
        let employees_affected = 0;

        // Create a Map to store existing schedules
        const existingSchedulesMap = new Map();

        // Get all the schedules at once
        const emp_ids = array_employee_emp_id;
        const days = weekdays;

        // Execute a single query to get all the existing schedules for the employees and days
        // We need to check for each emp_id and day
        const shift_schedules = await Promise.all(
            emp_ids.map(async (emp_id) => {
                const [result] = await db.query(sqlSelect, [emp_id, days]);
                return result;
            })
        );

        // Populate the map with the shift schedule data
        shift_schedules.flat().forEach(schedule => {
            const key = `${schedule.emp_ID}-${schedule.day}`;
            existingSchedulesMap.set(key, true);
        });

        // Loop through each employee and day to prepare the insertion data
        for (const emp_id of emp_ids) {
            let count_employees = 0;

            for (const day of weekdays) {
                const key = `${emp_id}-${day}`;
                // Check if the (emp_id, day) combination is already in the map (i.e., the shift exists)
                if (!existingSchedulesMap.has(key)) {
                    // If the schedule doesn't exist, prepare for insertion
                    insertValues.push([emp_id, shift_in, shift_out, day, admin_emp_id]);
                    count_employees++;
                }
            }

            // If at least one schedule was added for this employee, increment the affected count
            if (count_employees > 0) {
                employees_affected++;
            }
        }

        // If there are any values to insert, perform a batch insert
        if (insertValues.length > 0) {
            await db.query(sqlInsert, [insertValues]);
        }

        // Check the length of users
        const [users] = await db.query(sql);

        if (users.length === array_employee_emp_id.length) {
            return res.status(200).json({ success: 'Shift schedule for all employees has been updated.' });
        }

        return res.status(200).json({ success: `Shift schedule for ${employees_affected} employees has been updated.` });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update shift schedule.' });
    }
});


export const create_shift_schedule_current_month_weekday1 = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out } = req.body;

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlInsert = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by) VALUES ?';
        const sqlSelect = 'SELECT * FROM shift_schedule WHERE emp_ID = ? AND day = ?';

        const weekdays = getCurrentMonthWeekdays();

        // Prepare data for batch insertion
        const insertValues = [];
        let employees_affected = 0;

        for (const emp_id of array_employee_emp_id) {
            let count_employees = 0;

            for (const day of weekdays) {
                // Check if the schedule for this employee and day already exists
                const [shift_schedule] = await db.query(sqlSelect, [emp_id, day]);

                if (shift_schedule.length === 0) {
                   insertValues.push([emp_id, shift_in, shift_out, day, admin_emp_id]);
                    count_employees++;
                }
            }

            // If at least one schedule was added for this employee, increment the affected count
            if (count_employees > 0) {
                employees_affected++;
            }
        }
        // Perform batch insert if there are new records to insert
        if (insertValues.length > 0) {
            await db.query(sqlInsert, [insertValues]);
        }
        const [users] = await db.query(sql);

        if(users.length == array_employee_emp_id.length) {
            return res.status(200).json({ success: 'Shift schedule for all employees has been updated.' });
        }

        return res.status(200).json({ success: `Shift schedule for ${employees_affected} employees has been updated.` });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update shift schedule.' });
    }
});
