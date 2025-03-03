import React from "react";
import Box from "./Box";
import { Calendar, Video, Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome Dr. Simpal!</h1>

      {/* Stats Section */}
      <div className="flex gap-4 my-4">
        <Box icon={<Calendar size={24} />} count="50" label="Appointments" bgColor="bg-teal-500" />
        <Box icon={<Video size={24} />} count="50" label="Consultancy" bgColor="bg-blue-600" />
        <Box icon={<Users size={24} />} count="50" label="Pending" bgColor="bg-blue-400" />
      </div>

      {/* Today's List */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-lg w-1/3">
          <h2 className="text-lg font-bold mb-2">Today's List</h2>
          {/* Example of patient list item */}
          <div className="flex items-center gap-2 p-2 border-b">
            <img src="/path/to/avatar.jpg" alt="Patient" className="w-8 h-8 rounded-full" />
            <div>
              <p className="font-semibold">Sameer Shrestha</p>
              <p className="text-sm text-gray-500">Head pain</p>
            </div>
          </div>
          {/* Repeat patient list items */}
        </div>

        {/* Ongoing Appointment */}
        <div className="bg-white p-4 rounded-2xl shadow-lg w-2/3">
          <h2 className="text-lg font-bold mb-2">Ongoing Appointment</h2>
          <p><strong>Patient:</strong> Sameer Shrestha</p>
          <p><strong>Details:</strong> 20 yrs old, Male</p>
          <p><strong>Problem:</strong> Pain in upper stomach/nausea</p>
          <textarea className="w-full border rounded p-2 mt-2" placeholder="Consultation notes"></textarea>
          <button className="bg-teal-500 text-white px-4 py-2 rounded mt-2">Finish</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 

