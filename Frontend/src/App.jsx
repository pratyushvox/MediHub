import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Landingpage from './page/Landingpage';
import SignUp from './Page/Userauthentication/SignUp';
import Login from './Page/Userauthentication/Login';
import FormPage from './Page/Userauthentication/Personalinfo';
import PatientDashboard from './Page/Patient/Dashboard';
import AppointmentsList from './Page/Patient/Appointment';
import AdminLogin from './Page/Admin/Adminlogin';
import AdminDashboard from './Page/Admin/Admindashboard';
import DoctorList from './Page/Admin/Doctorlist';
import PatientList from './Page/Admin/Patientlist';
import DoctorLogin from './Page/Doctor/Doctorlogin';
import DoctorDashboard from './Page/Doctor/Docdashboard';

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/personalinfo/:id" element={<FormPage />} />
        <Route path="/Pdashboard/:id" element={<PatientDashboard />}/>
        <Route path="/patient/appointments" element={<AppointmentsList />}/>
        <Route path="/admin/Login" element={<AdminLogin />}/>
        <Route path="/admin/admindashboard" element={<AdminDashboard />}/>
        <Route path="/admin/doctorlist" element={<DoctorList />}/>
        <Route path="/admin/patientlist" element={<PatientList />}/>
        <Route path="/doctor/login" element={<DoctorLogin />}/>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />}/>


      </Routes>
    </Router>
  );
}

export default App;
