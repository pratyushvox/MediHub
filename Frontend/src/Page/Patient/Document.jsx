import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Documentcard } from '../../Component/Documentcard';
import Sidebar from '../../Component/Sidebar';
import PatientNavbar from '../../Component/Patientnavbar';

export function DocumentList() {
  const documents = [
    {
      title: 'Annual Report 2024.pdf',
      type: 'PDF',
      owner: 'John Doe',
      email: 'john@example.com',
      date: 'Mar 10, 2024'
    },
    {
      title: 'Project Proposal.docx',
      type: 'Word',
      owner: 'Jane Smith',
      email: 'jane@example.com',
      date: 'Mar 8, 2024'
    },
    {
      title: 'Financial Statement.xlsx',
      type: 'Excel',
      owner: 'Mike Johnson',
      email: 'mike@example.com',
      date: 'Mar 5, 2024'
    }
  ];

  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar role="patient" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full bg-gray-100 min-h-screen ml-64">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-64 right-0 z-30">
          <PatientNavbar pageTitle="Document Management" />
        </div>

        {/* Scrollable Content */}
        <div className="pt-16 p-8"> 
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mt-10">Document Management</h1>
              <p className="mt-1 text-sm text-gray-500">Add, Organize & access Your documents here.</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              <span>New Document</span>
            </button>
          </div>

          <div className="flex space-x-4 mb-12">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white">
              <option>All Document Types</option>
              <option>MRI</option>
              <option>Prescription</option>
              <option>Lab Report</option>
              <option>X-ray</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white">
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Name A-Z</option>
              <option>Name Z-A</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {documents.map((doc, index) => (
              <Documentcard key={index} {...doc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
