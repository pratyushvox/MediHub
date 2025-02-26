import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Landingpage from './Page/Landingpage';
import SignUp from './Page/Userauthentication/SignUp';
import Login from './Page/Userauthentication/Login'
import FormPage from './Page/Userauthentication/Personalinfo';
import PatientDashboard from './Page/Patient/Dashboard';
import AppointmentsList from './Page/Patient/Appointment';

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
      </Routes>
    </Router>
  );
}

export default App;
