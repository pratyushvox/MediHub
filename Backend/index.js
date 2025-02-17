import dotenv from 'dotenv';
import connectDB from './src/config/dbconnection.js';
import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/userRoutes.js';


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);  // Updated to use "/api/users" for consistency


// Server and Database Connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Failed', err);
  });
