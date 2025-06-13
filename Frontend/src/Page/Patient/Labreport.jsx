import React, { useState, useEffect, useRef } from 'react';
import Box from "../../Component/Box";
import Sidebar from "../../Component/Sidebar";
import PatientNavbar from "../../Component/PatientNavbar";
import { FileText, Download, Share2, Printer, ChevronDown, ChevronUp, Search, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Labreportstats = () => {
  const [expandedReport, setExpandedReport] = useState(null);
  const [sortBy, setSortBy] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [abnormalCount, setAbnormalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRefs = useRef({});

  useEffect(() => {
    const fetchLabReports = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        const userId = localStorage.getItem('Userid');
        if (!userId) {
          throw new Error("User ID not found in localStorage");
        }
        
        const userResponse = await axios.get(`http://localhost:4000/api/users/${userId}`);
        
        if (!userResponse.data || !userResponse.data.patientId) {
          throw new Error("Patient ID not found for this user");
        }
        
        const patientId = userResponse.data.patientId;
        console.log("Retrieved patient ID:", patientId);
        
        try {
          const response = await axios.get(`http://localhost:4000/api/patient/labresult/${patientId}`);
          
          console.log("API response:", response);
          
          let reportsData = [];
          
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            reportsData = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            reportsData = response.data;
          } else {
            console.log("Unexpected API response format, treating as no reports");
            reportsData = [];
          }
          
          if (reportsData.length === 0) {
            console.log("No lab reports found for this patient");
            setLabReports([]);
            setLoading(false);
            return;
          }
          
          const formattedReports = reportsData.map(report => ({
            id: report._id || String(Math.random()),
            patientId: report.patientId || "Unknown ID",
            patientName: report.patientName || "Unknown Patient",
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
          
        } catch (apiError) {
          // Handle 404 specifically - no reports found
          if (apiError.response && apiError.response.status === 404) {
            console.log("No lab reports found for this patient (404 response)");
            setLabReports([]);
          } else {
            // Handle other API errors
            throw apiError;
          }
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error("Error fetching lab reports:", err);
        
        // Provide more user-friendly error messages
        let errorMessage = "Failed to fetch lab reports";
        
        if (err.message === "User ID not found in localStorage") {
          errorMessage = "Please log in again to view your lab reports";
        } else if (err.message === "Patient ID not found for this user") {
          errorMessage = "Unable to find patient information for your account";
        } else if (err.response) {
          switch (err.response.status) {
            case 404:
              errorMessage = "No lab reports found for your account";
              setLabReports([]); // Set empty array instead of showing error
              setLoading(false);
              return; // Don't show error message for 404
            case 500:
              errorMessage = "Server error occurred. Please try again later";
              break;
            case 401:
              errorMessage = "Please log in again to access your reports";
              break;
            default:
              errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
          }
        } else if (err.request) {
          errorMessage = "Unable to connect to server. Please check your internet connection";
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchLabReports();
  }, []);

  useEffect(() => {
    const abnormalReports = labReports.filter(report => report.status === 'Abnormal');
    setAbnormalCount(abnormalReports.length);

    let results = labReports;
    
    if (searchQuery.trim() !== '') {
      results = labReports.filter(report => 
        (report.type && report.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.doctor && report.doctor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.date && report.date.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (sortBy === 'Newest First') {
      results.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    } else {
      results.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });
    }

    setFilteredReports(results);
  }, [searchQuery, sortBy, labReports]);

  // Generate PDF for a specific report
  const generatePDF = async (reportId) => {
    const reportElement = reportRefs.current[reportId];
    if (!reportElement) return;

    try {
      const report = labReports.find(r => r.id === reportId);
      if (!report) return;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Add clinic header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MediHub Clinic', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Kathmandu , Maitidevi marga ', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 5;
      pdf.text('Phone: 9811321046  | Email: medihubclinic1@gmail.com', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      // Report title
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LABORATORY TEST REPORT', pageWidth / 2, yPosition, { align: 'center' });
      
      // Patient information section
      yPosition += 16;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Patient Information', margin, yPosition);
      
      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Two-column layout for patient info
      const colWidth = contentWidth / 2;
      
      pdf.text(`Patient Name: ${report.patientName || 'Not available'}`, margin, yPosition);
      pdf.text(`Patient ID: ${report.patientId || 'Not available'}`, margin + colWidth, yPosition);
      
      yPosition += 6;
      pdf.text(`Test Type: ${report.type}`, margin, yPosition);
      pdf.text(`Test Date: ${report.date}`, margin + colWidth, yPosition);
      
      yPosition += 6;
      pdf.text(`Referring Doctor: ${report.doctor}`, margin, yPosition);
      pdf.text(`Report Status: ${report.status}`, margin + colWidth, yPosition);
      
      // Findings section
      yPosition += 12;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Findings:', margin, yPosition);
      
      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Handle multi-line findings text
      const findingsLines = pdf.splitTextToSize(report.details, contentWidth);
      pdf.text(findingsLines, margin, yPosition);
      
      yPosition += (findingsLines.length * 5) + 10;
      
      // Test parameters table
      if (report.parameters && report.parameters.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Test Parameters:', margin, yPosition);
        
        yPosition += 7;
        
        // Table headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
        
        const colWidths = [
          contentWidth * 0.3, // Parameter
          contentWidth * 0.2, // Result
          contentWidth * 0.3, // Reference Range
          contentWidth * 0.2  // Status
        ];
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        let xPos = margin;
        
        pdf.text('PARAMETER', xPos + 2, yPosition);
        xPos += colWidths[0];
        
        pdf.text('RESULT', xPos + 2, yPosition);
        xPos += colWidths[1];
        
        pdf.text('REFERENCE RANGE', xPos + 2, yPosition);
        xPos += colWidths[2];
        
        pdf.text('STATUS', xPos + 2, yPosition);
        
        yPosition += 5;
        
        // Table rows
        pdf.setFont('helvetica', 'normal');
        report.parameters.forEach((param, index) => {
          // Alternate row colors
          if (index % 2 === 1) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
          }
          
          xPos = margin;
          
          pdf.text(param.name || 'N/A', xPos + 2, yPosition);
          xPos += colWidths[0];
          
          pdf.text(param.result || 'N/A', xPos + 2, yPosition);
          xPos += colWidths[1];
          
          pdf.text(param.range || 'N/A', xPos + 2, yPosition);
          xPos += colWidths[2];
          
          // Add status with colored background
          const statusText = param.status || 'N/A';
          
          // Set status color
          if (statusText === 'Normal') {
            pdf.setTextColor(34, 139, 34); // Green for normal
          } else if (statusText === 'High' || statusText === 'Abnormal') {
            pdf.setTextColor(220, 20, 60); // Red for high/abnormal
          } else if (statusText === 'Low') {
            pdf.setTextColor(3, 102, 214); // Blue for low
          } else {
            pdf.setTextColor(0, 0, 0); // Black for other
          }
          
          pdf.text(statusText, xPos + 2, yPosition);
          pdf.setTextColor(0, 0, 0); // Reset text color
          
          yPosition += 8;
        });
      }
      
      // Footer
      const footerPosition = pdf.internal.pageSize.getHeight() - 10;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, footerPosition, { align: 'center' });
      pdf.text('MediHub Clinic - Caring for your health', pageWidth / 2, footerPosition + 4, { align: 'center' });
      
      // Save the PDF
      pdf.save(`MediHub-Lab-Report-${reportId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Enhanced print functionality
  const handlePrint = (reportId) => {
    const report = labReports.find(r => r.id === reportId);
    if (!report) return;

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>MediHub Clinic - Lab Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #ddd;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #0066cc;
            }
            .clinic-details {
              font-size: 12px;
              color: #666;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              color: #444;
            }
            .patient-info {
              margin-bottom: 20px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #555;
            }
            .findings {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f2f2f2;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            td {
              padding: 10px;
              border: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .normal {
              color: #22863a;
              font-weight: bold;
            }
            .abnormal, .high {
              color: #cb2431;
              font-weight: bold;
            }
            .low {
              color: #0366d6;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #666;
              text-align: center;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">MediHub Clinic</div>
            <div class="clinic-details">
              Kathmandu Maitidevi marga <br>
              Phone: 9811321046 | Email: medihubclinic1@gmail.com
            </div>
          </div>
          
          <div class="report-title">LABORATORY TEST REPORT</div>
          
          <div class="patient-info">
            <div><strong>Patient Name:</strong> ${report.patientName || 'Not available'}</div>
            <div><strong>Patient ID:</strong> ${report.patientId || 'Not available'}</div>
            <div><strong>Test Type:</strong> ${report.type}</div>
            <div><strong>Test Date:</strong> ${report.date}</div>
            <div><strong>Referring Doctor:</strong> ${report.doctor}</div>
            <div><strong>Report Status:</strong> <span class="${report.status.toLowerCase()}">${report.status}</span></div>
          </div>
          
          <div class="section-title">Findings:</div>
          <div class="findings">
            ${report.details}
          </div>
          
          <div class="section-title">Test Parameters:</div>
          <table>
            <thead>
              <tr>
                <th>PARAMETER</th>
                <th>RESULT</th>
                <th>REFERENCE RANGE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${report.parameters.map(param => `
                <tr>
                  <td>${param.name || 'N/A'}</td>
                  <td>${param.result || 'N/A'}</td>
                  <td>${param.range || 'N/A'}</td>
                  <td class="${param.status.toLowerCase()}">${param.status || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
            MediHub Clinic - Caring for your health
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Share functionality
  const handleShare = async (report) => {
    try {
      // Generate a text summary of the report
      const reportSummary = `
        Lab Report Summary:
        Test Type: ${report.type}
        Date: ${report.date}
        Doctor: ${report.doctor}
        Status: ${report.status}
        Findings: ${report.details}
        
        Parameters:
        ${report.parameters.map(p => `${p.name}: ${p.result} (${p.range}) - ${p.status}`).join('\n')}
      `;

      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: `Lab Report - ${report.type}`,
          text: reportSummary,
          // If you have a URL to share, include it here
          // url: 'https://yourwebsite.com/reports/' + report.id
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const emailSubject = `Lab Report - ${report.type}`;
        const emailBody = encodeURIComponent(reportSummary);
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      if (error.name !== 'AbortError') {
        alert('Sharing failed. You can manually copy the report details.');
      }
    }
  };

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
      <Sidebar role="patient" />
      
      <div className="flex-1">
        <PatientNavbar pageTitle="Lab Report" />
        
        {error && (
          <div className="p-6 ml-16">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
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

        <div className="px-6 mt-6 ml-16 pb-10">
          {labReports.length === 0 && !loading && !error ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Reports Found</h3>
              <p className="text-gray-500 mb-4">
                You don't have any lab reports yet. Lab reports will appear here after your tests are completed.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  <strong>What to expect:</strong> Once your doctor orders lab tests and results are ready, 
                  they will automatically appear in this section.
                </p>
              </div>
            </div>
          ) : filteredReports.length > 0 ? (
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
                  <div 
                    className="border-t px-4 py-4"
                    ref={(el) => (reportRefs.current[report.id] = el)}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Report Details</h4>
                      <div className="text-sm text-gray-500">
                        Report ID: {report.id}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{report?.details}</p>

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
                                <td className="px-4 py-2">{param?.name}</td>
                                <td className="px-4 py-2">{param?.result}</td>
                                <td className="px-4 py-2">{param?.range}</td>
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
                      <button 
                        onClick={() => generatePDF(report?.id)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </button>
                      <button 
                        onClick={() => handleShare(report)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </button>
                      <button 
                        onClick={() => handlePrint(report.id)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : labReports.length > 0 && filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No reports found matching your search criteria.</p>
              <p className="text-sm text-gray-400">Try adjusting your search terms or filters.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Labreportstats;