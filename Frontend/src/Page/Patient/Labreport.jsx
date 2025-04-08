import React, { useState, useEffect } from 'react';
import Box from "../../Component/Box";
import Sidebar from "../../Component/Sidebar";
import PatientNavbar from "../../Component/PatientNavbar";
import { FileText, Download, Share2, Printer, ChevronDown, ChevronUp, Search, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const Labreportstats = () => {
  const [expandedReport, setExpandedReport] = useState(null);
  const [sortBy, setSortBy] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [abnormalCount, setAbnormalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLabReports = async () => {
      try {
        setLoading(true);
        
        // Get the user ID from localStorage
        const userId = localStorage.getItem('Userid');
        if (!userId) {
          throw new Error("User ID not found in localStorage");
        }
        
        // First, fetch the patient ID associated with this user
        const userResponse = await axios.get(`http://localhost:4000/api/users/${userId}`);
        
        if (!userResponse.data || !userResponse.data.patientId) {
          throw new Error("Patient ID not found for this user");
        }
        
        const patientId = userResponse.data.patientId;
        console.log("Retrieved patient ID:", patientId);
        
        // Make API call to fetch lab results using the retrieved patient ID
        const response = await axios.get(`http://localhost:4000/api/patient/labresult/${patientId}`);
        
        console.log("API response:", response);
        
        // Check response structure and extract data
        let reportsData = [];
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          reportsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          reportsData = response.data;
        } else {
          throw new Error("Unexpected API response format");
        }
        
        if (reportsData.length === 0) {
          console.log("No lab reports found");
          setLabReports([]);
          setLoading(false);
          return;
        }
        
        // Transform the data to match our component's expected format
        const formattedReports = reportsData.map(report => ({
          id: report._id || String(Math.random()),
          type: report.testType || "Unknown Test",
          date: report.date ? new Date(report.date).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          }) : "Unknown Date",
          doctor: report.referringDoctor || 'Unknown Doctor',
          status: report.reportStatus || 'Normal',
          details: report.findings || 'No additional details provided.',
          parameters: Array.isArray(report.parameters) ? report.parameters.map(param => ({
            name: param.parameter || "Unknown Parameter",
            result: param.result || "N/A",
            range: param.referenceRange || "N/A",
            status: param.status || "Normal"
          })) : []
        }));
        
        setLabReports(formattedReports);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lab reports:", err);
        setError(`Failed to fetch lab reports: ${err.message}`);
        setLoading(false);
      }
    };

    fetchLabReports();
  }, []);

  useEffect(() => {
    // Calculate abnormal reports count
    const abnormalReports = labReports.filter(report => report.status === 'Abnormal');
    setAbnormalCount(abnormalReports.length);

    // Filter reports based on search query
    let results = labReports;
    
    if (searchQuery.trim() !== '') {
      results = labReports.filter(report => 
        (report.type && report.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.doctor && report.doctor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.date && report.date.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort reports
    if (sortBy === 'Newest First') {
      results.sort((a, b) => {
        // Handle potential invalid dates
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    } else {
      results.sort((a, b) => {
        // Handle potential invalid dates
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });
    }

    setFilteredReports(results);
  }, [searchQuery, sortBy, labReports]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="patient" />
        <div className="flex-1">
          <PatientNavbar pageTitle="Lab Report" />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar role="patient" />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Patient Navbar with "Lab Report" title */}
        <PatientNavbar pageTitle="Lab Report" />
        
        {/* Error message if applicable */}
        {error && (
          <div className="p-6 ml-16">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dashboard Stats - Horizontal Layout */}
        <div className="p-6 ml-16">
          <div className="flex flex-row gap-40">
            <Box
              count={filteredReports.length}
              label="Recent Lab Reports"
              className="bg-blue-100 text-blue-800 w-64"
              onClick={() => console.log('Recent Lab Reports clicked')}
            />
            
            <Box
              count={filteredReports.filter(r => r.status === 'Normal').length}
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
        <div className="px-6 mt-6 ml-16 pb-10">
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

                    {report.parameters && report.parameters.length > 0 ? (
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
                                    param.status === 'Low' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {param.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No parameter details available for this report.</p>
                    )}

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