import React from 'react';
import Medihublogo from "../Images/Medihublogo.png";

import { 
  Calendar, 
  FileText, 
  Home,
  Stethoscope,
  MessageSquare 
} from 'lucide-react';

const Sidebar = ({ role = 'patient', className = '' }) => {
  // Define different navigation items for each role
  const navigationConfig = {
    admin: [
      { title: 'Dashboard', icon: Home, href: '/admin/admindashboard' },
      { title: 'Patient', icon: Calendar, href: '/admin/patientlist' },
      { title: 'Doctor', icon: FileText, href: '/admin/doctorlist' },
      { title: 'Appointment', icon: MessageSquare, href: '/admin/consultation' },
      { title: 'Invoices', icon: FileText, href: '/admin/invoices' },
      { title: 'Inventory', icon: FileText, href: '/admin/invoices' },
    ],
    doctor: [
      { title: 'Dashboard', icon: Home, href: '/doctor' },
      { title: 'Appointments', icon: Calendar, href: '/doctor/appointments' },
      { title: 'Prescriptions', icon: FileText, href: '/doctor/prescriptions' },
      { title: 'Consultation', icon: MessageSquare, href: '/doctor/consultation' },
      { title: 'Invoices', icon: FileText, href: '/doctor/invoices' },
    ],
    patient: [
      { title: 'Dashboard', icon: Home, href: '/patient' },
      { title: 'Appointments', icon: Calendar, href: '/patient/appointments' },
      { title: 'Prescriptions', icon: FileText, href: '/patient/prescriptions' },
      { title: 'Consultation', icon: MessageSquare, href: '/patient/consultation' },
      { title: 'Invoices', icon: FileText, href: '/patient/invoices' },
    ],
  };

  const navigation = navigationConfig[role] || navigationConfig.patient;

  return (
    <div className={`flex flex-col w-64 bg-[#cffafe] min-h-screen p-4 ${className}`}>
      <div className="flex items-center justify-center mb-8 px-2">
        <img 
          src={Medihublogo} 
          alt="Medihub Logo" 
          className="h-28 w-auto"
        />
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.title}>
              <a
                href={item.href}
                className="flex items-center px-4 py-3 text-cyan-900 hover:bg-[#3CB5AE] hover:text-white rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
