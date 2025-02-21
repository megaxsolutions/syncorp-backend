// db.js
import mysql from 'mysql2/promise'; // Use promise-based version for async/await
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to check database connection
const checkDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection();
    await connection.query('SELECT 1'); // Simple query to check connection
    console.log('Database connected successfully');
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

// Check the database connection when the application starts
checkDatabaseConnection();

// Export the pool for use in your application
export default db;