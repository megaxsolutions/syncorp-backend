import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


export const get_all_dtr = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT
        id, emp_ID,  
        DATE_FORMAT(timein, '%Y-%m-%d %H:%i:%s') AS timein,
        DATE_FORMAT(timeout, '%Y-%m-%d %H:%i:%s') AS timeout,
        DATE_FORMAT(shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in,
        DATE_FORMAT(shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        employee_name, employee_level, job_title, late, 
        undertime, status, total_hrs, state, rh, rh_ot, sh, sh_ot, _2_rh, 
        nt, nt_ot, sh_nt, rh_nt, sh_nt_ot, rh_nt_ot, _2_rh_nt, _2_rh_ot, 
        _2_rh_nt_ot, rd, rd_sh, rd_rh, rd_nt, rd_2_rh,rd_2_rh_nt, rd_sh_nt, 
        rd_rh_nt, rd_sh_ot, rd_rh_ot, rd_2_rh_ot, rd_nt_ot, rd_sh_nt_ot, 
        rd_rh_nt_ot, rd_2rh_nt_ot, rd_ot, reg_hr, reg_ot_hr, departmentID, 
        siteID, accountID, clusterID, payroll_id, unique_record, att_id 
        FROM dtr`; // Use a parameterized query

        const [dtr] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: dtr });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_user_dtr = asyncHandler(async (req, res) => {
    const { emp_id, cutoff_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = `SELECT
        id, emp_ID,  
        DATE_FORMAT(timein, '%Y-%m-%d %H:%i:%s') AS timein,
        DATE_FORMAT(timeout, '%Y-%m-%d %H:%i:%s') AS timeout,
        DATE_FORMAT(shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in,
        DATE_FORMAT(shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        employee_name, employee_level, job_title, late, 
        undertime, status, total_hrs, state, rh, rh_ot, sh, sh_ot, _2_rh, 
        nt, nt_ot, sh_nt, rh_nt, sh_nt_ot, rh_nt_ot, _2_rh_nt, _2_rh_ot, 
        _2_rh_nt_ot, rd, rd_sh, rd_rh, rd_nt, rd_2_rh, rd_2_rh_nt, rd_sh_nt, 
        rd_rh_nt, rd_sh_ot, rd_rh_ot, rd_2_rh_ot, rd_nt_ot, rd_sh_nt_ot, 
        rd_rh_nt_ot, rd_2rh_nt_ot, rd_ot, reg_hr, reg_ot_hr, departmentID, 
        siteID, accountID, clusterID, payroll_id, unique_record, att_id,
        FORMAT(SUM(rh_ot) + SUM(sh_ot) + SUM(nt_ot) + SUM(nt_ot) +
        SUM(sh_nt_ot) + SUM(rh_nt_ot) + SUM(_2_rh_ot) + SUM(_2_rh_nt_ot) +
        SUM(rd) + SUM(rd_sh) + SUM(rd_rh) + SUM(rd_nt) +
        SUM(rd_2_rh) + SUM(rd_2_rh_nt) + SUM(rd_sh_nt) + SUM(rd_rh_nt) +
        SUM(rd_sh_ot) + SUM(rd_rh_ot) + SUM(rd_2_rh_ot) + SUM(rd_nt_ot) +
        SUM(rd_sh_nt_ot) + SUM(rd_rh_nt_ot) + SUM(rd_2rh_nt_ot) + SUM(rd_ot) +
        SUM(reg_ot_hr),2) AS overtime
        FROM dtr WHERE emp_ID = ? AND payroll_id = ?
        GROUP BY id`; // Use a parameterized query

        const [data_dtr] = await db.query(sql, [emp_id, cutoff_id]);

        let totalOvertime = 0;
        let totalLate = 0;
        let totalUndertime = 0;
        let count = 0;

        
        const dtr_computation = await Promise.all(
            data_dtr.map(async (dtr) => {
                const overtime = parseFloat(dtr.overtime) || 0; // Ensure to handle null or undefined
                const late = parseFloat(dtr.late) || 0; // Ensure to handle null or undefined
                const undertime = parseFloat(dtr.undertime) || 0; // Ensure to handle null or undefined

                totalOvertime += overtime;
                totalLate += late;
                totalUndertime += undertime;

                count++;

                return dtr;
            })
        );

        const averageOvertime = count > 0 ? (totalOvertime / count).toFixed(2) : 0; // Calculate average
        const averageUndertime = count > 0 ? (totalUndertime / count).toFixed(2) : 0; // Calculate average
        const averageLate = count > 0 ? (totalLate / count).toFixed(2) : 0; // Calculate average


        const result = {
            overtime_average : averageOvertime,
            late_average : averageLate,
            undertime_average : averageUndertime,
            late_and_undertime_average : ((totalLate / count) + (totalUndertime / count)).toFixed(2),
            dtr: data_dtr
        };

        // Return the merged results in the response
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const get_all_user_dtr_admin = asyncHandler(async (req, res) => {
    const { cutoff_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = `SELECT
        id, emp_ID,  
        DATE_FORMAT(timein, '%Y-%m-%d %H:%i:%s') AS timein,
        DATE_FORMAT(timeout, '%Y-%m-%d %H:%i:%s') AS timeout,
        DATE_FORMAT(shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in,
        DATE_FORMAT(shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        employee_name, employee_level, job_title, late, 
        undertime, status, total_hrs, state, rh, rh_ot, sh, sh_ot, _2_rh, 
        nt, nt_ot, sh_nt, rh_nt, sh_nt_ot, rh_nt_ot, _2_rh_nt, _2_rh_ot, 
        _2_rh_nt_ot, rd, rd_sh, rd_rh, rd_nt, rd_2_rh,rd_2_rh_nt, rd_sh_nt, 
        rd_rh_nt, rd_sh_ot, rd_rh_ot, rd_2_rh_ot, rd_nt_ot, rd_sh_nt_ot, 
        rd_rh_nt_ot, rd_2rh_nt_ot, rd_ot, reg_hr, reg_ot_hr, departmentID, 
        siteID, accountID, clusterID, payroll_id, unique_record, att_id 
        FROM dtr WHERE payroll_id = ?`; // Use a parameterized query

        const [dtr] = await db.query(sql, [cutoff_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: dtr });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


