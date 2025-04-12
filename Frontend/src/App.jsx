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
import { DocumentList } from './Page/Patient/Document';
import ViewAppointmentlist from './Page/Admin/Appointment';
import PaymentStatusPage from './Page/Admin/Paymentstatus';
import VerifyPayment from './Page/Patient/Verify';
import SuccessPage from './Page/Patient/OnlinebookingSuccess';
import Labreportstats from './Page/Patient/Labreport';
import AdminLabReports from './Page/Admin/Labreport';
import ClinicTestRequestForm from './Component/ClinicLabForm';
import  AppointmentsTable from './Page/Doctor/Appointment'

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
        <Route path="/Patient/Documentlist" element={<DocumentList />}/>
        <Route path="/admin/viewappointmentlist" element={<ViewAppointmentlist/>}/>
        <Route path="/admin/paymentstatus" element={<PaymentStatusPage/>}/>
        <Route path="/payment/verify" element={<VerifyPayment/>}/>
        <Route path="/payment/sucess" element={<SuccessPage/>}/>
        <Route path="/Patient/Labreport" element={<Labreportstats/>}/>
        <Route path="/admin/Labreport" element={<AdminLabReports/>}/>
        <Route path="/admin/Labform" element={<ClinicTestRequestForm/>}/>
        <Route path="/doctor/viewappointment" element={<AppointmentsTable/>}/>




      </Routes>
    </Router>
  );
}

export default App;
