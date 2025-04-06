import React, { useState, useEffect } from 'react';
import Box from "../../Component/Box";
import Sidebar from "../../Component/Sidebar";
import PatientNavbar from "../../Component/PatientNavbar";
import { FileText, Download, Share2, Printer, ChevronDown, ChevronUp, Search, AlertTriangle } from 'lucide-react';

const Labreportstats = () => {
  const [expandedReport, setExpandedReport] = useState(null);
  const [sortBy, setSortBy] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [abnormalCount, setAbnormalCount] = useState(0);

  const labReports = [
    {
      id: '1',
      type: 'Blood Test',
      date: 'Mar 10, 2025',
      doctor: 'Dr. Sarah Johnson',
      status: 'Abnormal',
      details: 'Patient shows signs of mild anemia. Recommend iron supplements and follow-up in 4 weeks.',
      parameters: [
        { name: 'Hemoglobin', result: '10.2 g/dL', range: '12.0-15.5', status: 'Low' },
        { name: 'White Blood Cells', result: '11.3 103/µL', range: '4.5-11.0', status: 'High' },
        { name: 'Glucose', result: '98 mg/dL', range: '70-100', status: 'Normal' },
      ]
    },
    {
      id: '2',
      type: 'Urinalysis',
      date: 'Mar 5, 2025',
      doctor: 'Dr. Emily Martinez',
      status: 'Abnormal',
      details: 'Elevated protein levels detected. Recommend follow-up testing and possible nephrology consultation.',
      parameters: [
        { name: 'pH', result: '6.0', range: '4.5-8.0', status: 'Normal' },
        { name: 'Protein', result: '30 mg/dL', range: '<20', status: 'High' },
        { name: 'Glucose', result: 'Negative', range: 'Negative', status: 'Normal' },
        { name: 'Ketones', result: 'Trace', range: 'Negative', status: 'High' },
      ]
    },
    {
      id: '3',
      type: 'Thyroid Panel',
      date: 'Feb 28, 2025',
      doctor: 'Dr. Michael Chen',
      status: 'Normal',
      details: 'All thyroid levels within normal range. No medication adjustment needed at this time.',
      parameters: [
        { name: 'TSH', result: '2.1 mIU/L', range: '0.4-4.0', status: 'Normal' },
        { name: 'Free T4', result: '1.1 ng/dL', range: '0.8-1.8', status: 'Normal' },
      ]
    },
  ];

  useEffect(() => {
    // Calculate abnormal reports count
    const abnormalReports = labReports.filter(report => report.status === 'Abnormal');
    setAbnormalCount(abnormalReports.length);

    // Filter reports based on search query
    let results = labReports.filter(report => 
      report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.date.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort reports
    if (sortBy === 'Newest First') {
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredReports(results);
  }, [searchQuery, sortBy]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar role="patient" />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Patient Navbar with "Lab Report" title */}
        <PatientNavbar pageTitle="Lab Report" />
        
        {/* Dashboard Stats - Horizontal Layout */}
        <div className="p-6 ml-16">
          <div className="flex flex-row gap-40">
            <Box
              count={labReports.length}
              label="Recent Lab Reports"
              className="bg-blue-100 text-blue-800 w-64"
              onClick={() => console.log('Recent Lab Reports clicked')}
            />
            
            <Box
              count={labReports.filter(r => r.status === 'Normal').length}
              label="Normal Findings"
              className="bg-green-100 text-green-800 w-64"
              onClick={() => console.log('Normal Findings clicked')}
            />
            
            <Box
              count={abnormalCount}
              label="Abnormal Findings"
              className="bg-red-100 text-red-800 w-64"
              onClick={() => console.log('Abnormal Findings clicked')}
            />
          </div>
        </div>

        {/* Abnormal Report Alert */}
        {abnormalCount > 0 && (
          <div className="mx-16 mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Important Notice</h3>
                <p className="text-red-600">
                  You have {abnormalCount} abnormal report{abnormalCount > 1 ? 's' : ''}. Please consult with your doctor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="px-6 ml-16">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>
        </div>

        {/* Lab Reports List */}
        <div className="px-6 mt-6 ml-16">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report.id} className="mb-4 bg-white rounded-lg shadow">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <h3 className="font-medium">{report.type}</h3>
                      <p className="text-sm text-gray-500">
                        {report.date} • {report.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      report.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                    {expandedReport === report.id ? (
                      <ChevronUp className="h-5 w-5 ml-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 ml-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedReport === report.id && (
                  <div className="border-t px-4 py-4">
                    <h4 className="font-medium mb-2">Report Details</h4>
                    <p className="text-gray-600 mb-4">{report.details}</p>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">PARAMETER</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">RESULT</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">REFERENCE RANGE</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.parameters.map((param, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2">{param.name}</td>
                              <td className="px-4 py-2">{param.result}</td>
                              <td className="px-4 py-2">{param.range}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                  param.status === 'Normal' ? 'bg-green-100 text-green-800' :
                                  param.status === 'High' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {param.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reports found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Labreportstats;