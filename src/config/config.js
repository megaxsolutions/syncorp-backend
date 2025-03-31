import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_BASE_URL, 'http://localhost:5173'], // Adjust this to your React app's URL
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME_1,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db2 = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME_2,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to check database connection
const checkDatabaseConnection1 = async () => {
  try {
    const connection = await db.getConnection();
    connection.query('SELECT 1');
    console.log('Database 1 connected successfully');
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

const checkDatabaseConnection2 = async () => {
  try {
    const connection = await db2.getConnection();
    connection.query('SELECT 1');
    console.log('Database 2 connected successfully');
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

// Check the database connection when the application starts
checkDatabaseConnection1();
checkDatabaseConnection2();




// Export the server and io
export { server, io, app, db, db2 };

// Optionally, you can also export the app if needed
export default app;