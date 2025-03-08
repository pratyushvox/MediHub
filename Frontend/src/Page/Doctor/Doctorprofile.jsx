import React from 'react';
import { Settings, Star, Edit } from 'lucide-react';

function DoctorProfile() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop"
                alt="Doctor"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-lg font-semibold">Sameer Shrestha</h2>
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" /> {/* Half star */}
                </div>
                <p className="text-gray-600">MBBS</p>
                <p className="text-gray-500 text-sm">Medihub Clinic, Bir Hospital</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-teal-500 hover:text-teal-700 transition">
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button>
          </div>
        </div>

        {/* Speciality & Experience Card */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Speciality</h3>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Cardiology</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Neurology</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Psychology</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Experience</h3>
              <p className="text-sm text-gray-600">10 years +</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Email Address</h3>
              <p className="text-sm text-gray-600">abc@gmail.com</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Phone No</h3>
              <p className="text-sm text-gray-600">9814542104</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Address</h3>
              <p className="text-sm text-gray-600">Kathmandu, Maitidevi</p>
            </div>
          </div>
        </div>

        {/* Review and Feedback Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-center mb-4">Review and Feedback</h2>

          {/* Review Item */}
          {[1, 2].map((_, index) => (
            <div key={index} className="flex gap-4 items-center border-b pb-4 mb-4">
              <img
                src="https://randomuser.me/api/portraits/women/68.jpg"
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-gray-700 text-sm">Great doctor!!</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
