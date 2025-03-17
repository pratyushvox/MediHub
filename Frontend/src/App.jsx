import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Landingpage from './page/Landingpage';
import SignUp from './Page/Userauthentication/SignUp';
import Login from './Page/Userauthentication/Login';
import FormPage from './Page/Userauthentication/Personalinfo';
import PatientDashboard from './Page/Patient/Dashboard';
import AppointmentsList from './Page/Patient/ViewAppointment';
import AdminLogin from './Page/Admin/Adminlogin';
import AdminDashboard from './Page/Admin/Admindashboard';
import DoctorList from './Page/Admin/Doctorlist';
import PatientList from './Page/Admin/Patientlist';
import DoctorLogin from './Page/Doctor/Doctorlogin';
import DoctorDashboard from './Page/Doctor/Docdashboard';
import Doctorprofile from './Page/Doctor/Doctorprofile';
import Patientprofile from './Page/Patient/Patientprofile';
import BookAppointment from './Page/Patient/Bookappointment';

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/personalinfo" element={<FormPage />} />
        <Route path="/Pdashboard" element={<PatientDashboard />}/>
        <Route path="/patient/viewappointments" element={<AppointmentsList />}/>
        <Route path="/admin/Login" element={<AdminLogin />}/>
        <Route path="/admin/admindashboard" element={<AdminDashboard />}/>
        <Route path="/admin/doctorlist" element={<DoctorList />}/>
        <Route path="/admin/patientlist" element={<PatientList />}/>
        <Route path="/doctor/login" element={<DoctorLogin />}/>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />}/>
        <Route path="/doctor/profile" element={<Doctorprofile />}/>
        <Route path="/Patient/profile" element={<Patientprofile />}/>
        <Route path="/Patient/BookAppointment" element={<BookAppointment />}/>



      </Routes>
    </Router>
  );
}

export default App;
