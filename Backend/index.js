import dotenv from 'dotenv';
import connectDB from './src/config/dbconnection.js';
import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/userRoutes.js';
import Adminroutes from "./src/routes/Admin/Adminroutes.js"
import Doctorroutes from "./src/routes/Doctor/Doctorroutes.js"
import Displaydataroutes from "./src/routes/Displaydataroutes.js"
import AppointmentRoutes from "./src/routes/Appointment/AppointmentRoutes.js"
import Paymentroutes from "./src/routes/Paymentroutes/Paymentroutes.js"


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);  // Updated to use "/api/users" for consistency
app.use("/api", Adminroutes); 
app.use('/api', Doctorroutes);
app.use('/api', Displaydataroutes);
app.use('/api', AppointmentRoutes);
app.use('/api/Payment', Paymentroutes)





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
