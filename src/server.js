import express from 'express';
import cors from 'cors';
import userRoutes from "./routes/user_routes.js";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { authenticateToken } from "./middleware/auth.js";


dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.text()); // Handles text/plain content type
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.use("/users", userRoutes);

app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', data: req.user });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});