import React from 'react';
import { X, FileText, Clock, User, ClipboardList } from 'lucide-react';

const PrescriptionModal = ({ isOpen, onClose, appointments }) => {
  if (!isOpen) return null;

  // Get completed appointments with consultation notes
  const completedAppointments = appointments
    .filter(appt => appt.consultationStatus === "completed")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0367A5]">Your Prescriptions & Consultation Notes</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-[#0367A5] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Completed Consultations ({completedAppointments.length})
          </h3>
          
          {completedAppointments.length > 0 ? (
            <div className="space-y-6">
              {completedAppointments.map((appt, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-semibold text-lg">
                      Consultation with Dr. {appt.bookedDoctor?.name}
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                      Completed
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Date & Time</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(appt.appointmentDate)} at {appt.appointmentTime}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Doctor</div>
                        <div className="text-sm text-gray-600">
                          Dr. {appt.bookedDoctor?.name}
                          {appt.bookedDoctor?.specialization && ` (${appt.bookedDoctor?.specialization})`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <ClipboardList className="w-4 h-4" /> Consultation Reason
                    </div>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      {appt.appointmentReason || "No reason specified"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Consultation Notes & Prescription</div>
                    {appt.consultationNotes ? (
                      <div className="bg-blue-50 p-4 rounded text-sm whitespace-pre-wrap">
                        {appt.consultationNotes}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded text-sm text-gray-500 italic">
                        No consultation notes available
                      </div>
                    )}
                  </div>
                  
                  {appt.prescriptionDetails && (
                    <div className="mt-4">
                      <div className="font-medium text-gray-700 mb-1">Medication Details</div>
                      <div className="bg-yellow-50 p-4 rounded text-sm">
                        {appt.prescriptionDetails}
                      </div>
                    </div>
                  )}
                  
                  {index < completedAppointments.length - 1 && (
                    <div className="border-b my-4"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-500 italic">No completed consultations found</div>
              <p className="text-sm text-gray-500 mt-2">
                Once you have completed appointments with doctors, your consultation notes and prescriptions will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#0367A5] text-white rounded hover:bg-[#024e7a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;