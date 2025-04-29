import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { NotificationProvider } from '../src/Context/Notificationcontext';
import PatientChat from './Page/Patient/Patientchat';

// Landing Page
import Landingpage from './page/Landingpage';

// User Authentication
import SignUp from './Page/Userauthentication/SignUp';
import Login from './Page/Userauthentication/Login';
import FormPage from './Page/Userauthentication/Personalinfo';

// Patient Routes
import PatientDashboard from './Page/Patient/Dashboard';
import AppointmentsList from './Page/Patient/ViewAppointment';
import Patientprofile from './Page/Patient/Patientprofile';
import BookAppointment from './Page/Patient/Bookappointment';
import { DocumentList } from './Page/Patient/Document';
import VerifyPayment from './Page/Patient/Verify';
import SuccessPage from './Page/Patient/OnlinebookingSuccess';
import Labreportstats from './Page/Patient/Labreport';
import Doctorprofilenadreview from './Page/Patient/DoctorProfileView';

// Admin Routes
import AdminLogin from './Page/Admin/Adminlogin';
import AdminDashboard from './Page/Admin/Admindashboard';
import DoctorList from './Page/Admin/Doctorlist';
import PatientList from './Page/Admin/Patientlist';
import ViewAppointmentlist from './Page/Admin/Appointment';
import PaymentStatusPage from './Page/Admin/Paymentstatus';
import AdminLabReports from './Page/Admin/Labreport';

// Doctor Routes
import DoctorLogin from './Page/Doctor/Doctorlogin';
import DoctorDashboard from './Page/Doctor/Docdashboard';
import Doctorprofile from './Page/Doctor/Doctorprofile';
import AppointmentsTable from './Page/Doctor/Appointment';
import Patientprofiledoctor from './Page/Doctor/Patientprofileview';
import Doctordash from './Page/Doctor/Docdashboard';
import DoctorChat from './Page/Doctor/Doctorchat';

// Components
import ClinicTestRequestForm from './Component/ClinicLabForm';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landingpage />} />
          
          {/* User Authentication */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/personalinfo" element={<FormPage />} />
          
          {/* Patient Routes */}
          <Route path="/Pdashboard" element={<PatientDashboard />} />
          <Route path="/patient/viewappointments" element={<AppointmentsList />} />
          <Route path="/Patient/profile" element={<Patientprofile />} />
          <Route path="/Patient/BookAppointment" element={<BookAppointment />} />
          <Route path="/Patient/Documentlist" element={<DocumentList />} />
          <Route path="/payment/verify" element={<VerifyPayment />} />
          <Route path="/payment/sucess" element={<SuccessPage />} />
          <Route path="/Patient/Labreport" element={<Labreportstats />} />
          <Route path="/Patient/Doctor/:id" element={<Doctorprofilenadreview />} />
          <Route path="/Patient/chat" element={<PatientChat />} />
          
          {/* Admin Routes */}
          <Route path="/admin/Login" element={<AdminLogin />} />
          <Route path="/admin/admindashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctorlist" element={<DoctorList />} />
          <Route path="/admin/patientlist" element={<PatientList />} />
          <Route path="/admin/viewappointmentlist" element={<ViewAppointmentlist />} />
          <Route path="/admin/paymentstatus" element={<PaymentStatusPage />} />
          <Route path="/admin/Labreport" element={<AdminLabReports />} />
          <Route path="/admin/Labform" element={<ClinicTestRequestForm />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/profile" element={<Doctorprofile />} />
          <Route path="/doctor/viewappointment" element={<AppointmentsTable />} />
          <Route path="/doctor/patient/:id" element={<Patientprofiledoctor />} />
          <Route path="/doctor/chat" element={<DoctorChat />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;