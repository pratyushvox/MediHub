import dotenv from 'dotenv';
import connectDB from './src/config/dbconnection.js';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './src/Socket/Socket.js';
import Notificationroutes from "./src/routes/Notification/Notificationroutes.js";
import Chatroutes from "./src/routes/Chat/Chatroutes.js"




import userRoutes from './src/routes/userRoutes.js';
import Adminroutes from "./src/routes/Admin/Adminroutes.js"
import Doctorroutes from "./src/routes/Doctor/Doctorroutes.js"
import Displaydataroutes from "./src/routes/Displaydataroutes.js"
import AppointmentRoutes from "./src/routes/Appointment/AppointmentRoutes.js"
import Paymentroutes from "./src/routes/Paymentroutes/Paymentroutes.js"
import labreportroutes from "./src/routes/Labreport/Labreportroutes.js"
import Reviewandcommentroutes from "./src/routes/Reviewandcommentroutes/Reviewandcommentroutes.js"
import Fileuploadroutes from "./src/routes/Fileupload/Fileuploadroutes.js"





dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// HTTP server for socket.io

const server = http.createServer(app);

// Initialize socket.io server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // adjust to your frontend origin
    methods: ['GET', 'POST']
  }
});
setupSocket(io); // 

// Routes
app.use('/api/users', userRoutes);  // Updated to use "/api/users" for consistency
app.use("/api", Adminroutes); 
app.use('/api', Doctorroutes);
app.use('/api', Displaydataroutes);
app.use('/api', AppointmentRoutes);
app.use('/api/Payment', Paymentroutes)
app.use("/api", labreportroutes); 
app.use("/api/reviews",Reviewandcommentroutes );
app.use('/api/files',Fileuploadroutes);
app.use('/api/notifications', Notificationroutes);
app.use('/api/chat', Chatroutes);






// Server and Database Connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running with Socket.IO at: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Failed', err);
  });