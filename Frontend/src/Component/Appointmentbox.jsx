import React from "react";

const AppointmentCard = () => {
  // Dummy data (Replace with actual data from your database)
  const appointment = {
    doctor: "Dr. Bipin Neupane",
    specialty: "GENERAL MEDICINE",
    patient: "Pratyush Khadka",
    appDateAD: "2025/02/16 AD 01:25 PM",
    appDateBS: "2081/11/04 BS SUNDAY",
    appNumber: "55530054",
    urgent: true,
    telemedicine: true,
  };

  return (
    <div className="border rounded-lg shadow-md p-4 w-96 bg-white">
      {appointment.urgent && (
        <span className="bg-[#0367A5] text-white text-xs font-bold px-2 py-1 rounded">Urgent</span>
      )}
      <div className="text-right text-sm text-[#0367A5]">App no: <span className="font-semibold">{appointment.appNumber}</span></div>
      <h2 className="text-lg font-semibold mt-2 text-[#0367A5]">{appointment.doctor}</h2>
      <p className="text-sm text-[#3CB5AE]">{appointment.specialty}</p>
      <p className="text-sm mt-2"><span className="font-semibold">Patient:</span> {appointment.patient}</p>
      <p className="text-sm mt-1 flex items-center">
        <span className="mr-1">📅</span> Appt. Date <br />
        <span className="font-semibold text-[#0367A5]">{appointment.appDateAD}</span> <br />
        <span className="text-[#3CB5AE]">{appointment.appDateBS}</span>
      </p>
      {appointment.telemedicine && (
        <div className="mt-3 flex items-center">
          <button className="bg-[#3CB5AE] text-white px-4 py-1 rounded-md text-sm">Free</button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
