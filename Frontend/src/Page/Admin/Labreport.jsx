import React, { useState, useEffect } from 'react';
import Sidebar from "../../Component/Sidebar";
import { FileText, Download, Share2, Printer, ChevronDown, ChevronUp, Search, PlusCircle, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLabReports = () => {
  const navigate = useNavigate();
  const [expandedReport, setExpandedReport] = useState(null);
  const [sortBy, setSortBy] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [labReports, setLabReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [newReport, setNewReport] = useState({
    patientId: '',
    patientName: '',
    testType: '',
    date: new Date().toISOString().split('T')[0],
    referringDoctor: '',
    reportStatus: 'Normal',
    findings: '',
    parameters: [{
      parameter: '',
      result: '',
      referenceRange: '',
      status: 'Normal'
    }]
  });

  // Fetch lab reports from API
  useEffect(() => {
    const fetchLabReports = async () => {
      try {
        setIsFetching(true);
        const response = await fetch('http://localhost:4000/api/labresult/getall');
        if (!response.ok) {
          throw new Error('Failed to fetch lab reports');
        }
        const data = await response.json();
        setLabReports(data.data);
        setFilteredReports(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchLabReports();
  }, []);

  // Filter and sort reports
  useEffect(() => {
    let results = labReports.filter(report => 
      report.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.referringDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(report.date).toLocaleDateString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'Newest First') {
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredReports(results);
  }, [searchQuery, sortBy, labReports]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newReport.patientId.trim()) errors.patientId = 'Patient ID is required';
    if (!newReport.patientName.trim()) errors.patientName = 'Patient name is required';
    if (!newReport.testType.trim()) errors.testType = 'Test type is required';
    if (!newReport.referringDoctor.trim()) errors.referringDoctor = 'Referring doctor is required';
    if (!newReport.findings.trim()) errors.findings = 'Findings are required';
    
    const parameterErrors = [];
    newReport.parameters.forEach((param, index) => {
      const paramErrors = {};
      if (!param.parameter.trim()) paramErrors.parameter = 'Parameter name is required';
      if (!param.result.trim()) paramErrors.result = 'Result is required';
      if (!param.referenceRange.trim()) paramErrors.referenceRange = 'Reference range is required';
      if (Object.keys(paramErrors).length > 0) {
        parameterErrors[index] = paramErrors;
      }
    });
    
    if (parameterErrors.length > 0) {
      errors.parameters = parameterErrors;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewLabForm = () => {
    navigate('/admin/Labform');
  };

  const handleAddParameter = () => {
    setNewReport({
      ...newReport,
      parameters: [...newReport.parameters, { 
        parameter: '', 
        result: '', 
        referenceRange: '', 
        status: 'Normal' 
      }]
    });
  };

  const handleParameterChange = (index, field, value) => {
    const updatedParameters = [...newReport.parameters];
    updatedParameters[index][field] = value;
    
    if (field === 'result' || field === 'referenceRange') {
      const rangeParts = updatedParameters[index].referenceRange?.split('-');
      if (rangeParts?.length === 2) {
        const min = parseFloat(rangeParts[0]);
        const max = parseFloat(rangeParts[1]);
        const resultValue = parseFloat(updatedParameters[index].result);
        
        if (!isNaN(resultValue)) {
          if (resultValue < min) {
            updatedParameters[index].status = 'Low';
          } else if (resultValue > max) {
            updatedParameters[index].status = 'High';
          } else {
            updatedParameters[index].status = 'Normal';
          }
        }
      }
    }
    
    setNewReport({
      ...newReport,
      parameters: updatedParameters
    });

    if (formErrors.parameters?.[index]) {
      const newErrors = {...formErrors};
      delete newErrors.parameters[index];
      if (Object.keys(newErrors.parameters).length === 0) {
        delete newErrors.parameters;
      }
      setFormErrors(newErrors);
    }
  };

  const handleRemoveParameter = (index) => {
    const updatedParameters = [...newReport.parameters];
    updatedParameters.splice(index, 1);
    setNewReport({
      ...newReport,
      parameters: updatedParameters
    });

    if (formErrors.parameters?.[index]) {
      const newErrors = {...formErrors};
      delete newErrors.parameters[index];
      if (Object.keys(newErrors.parameters).length === 0) {
        delete newErrors.parameters;
      }
      setFormErrors(newErrors);
    }
  };

  const handleSubmitReport = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/labresult/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReport,
          date: new Date(newReport.date)
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Refresh the reports list
      const refreshResponse = await fetch('http://localhost:4000/api/labresult/getall');
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh lab reports');
      }
      const refreshData = await refreshResponse.json();
      setLabReports(refreshData.data);
      setFilteredReports(refreshData.data);
      
      // Close modal and reset form
      setIsAddModalOpen(false);
      setNewReport({
        patientId: '',
        patientName: '',
        testType: '',
        date: new Date().toISOString().split('T')[0],
        referringDoctor: '',
        reportStatus: 'Normal',
        findings: '',
        parameters: [{ 
          parameter: '', 
          result: '', 
          referenceRange: '', 
          status: 'Normal' 
        }]
      });
      setFormErrors({});
      
    } catch (err) {
      setError(err.message || 'Failed to create lab report');
      console.error('Error creating lab report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="admin" />
        <div className="flex-1 p-6 ml-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading lab reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 ml-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Lab Reports</h2>
            <p className="text-gray-600">{labReports.length} total reports</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleNewLabForm}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              New Lab Form
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              Create Lab Report
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-auto md:flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search reports by patient, doctor, type..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{report.testType}</h3>
                      <p className="text-sm text-gray-500">
                        {report.patientName} ({report.patientId}) • {formatDate(report.date)} • {report.referringDoctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.reportStatus === 'Normal' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.reportStatus}
                    </span>
                    {expandedReport === report._id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedReport === report._id && (
                  <div className="border-t border-gray-200 px-4 py-4">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Report Details</h4>
                      <p className="text-gray-600 whitespace-pre-line">{report.findings}</p>
                    </div>

                    <div className="mb-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {report.parameters.map((param, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{param.parameter}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{param.result}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{param.referenceRange}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  param.status === 'Normal' 
                                    ? 'bg-green-100 text-green-800' 
                                    : param.status === 'High' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {param.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Printer className="h-4 w-4" />
                        Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No lab reports found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or create a new report</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Create New Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Report Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">Create Lab Report</h2>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Patient ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReport.patientId}
                    onChange={(e) => setNewReport({...newReport, patientId: e.target.value})}
                    className={`w-full border ${formErrors.patientId ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="PAT001"
                  />
                  {formErrors.patientId && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.patientId}</p>
                  )}
                </div>
                
                {/* Patient Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReport.patientName}
                    onChange={(e) => setNewReport({...newReport, patientName: e.target.value})}
                    className={`w-full border ${formErrors.patientName ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="John Doe"
                  />
                  {formErrors.patientName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.patientName}</p>
                  )}
                </div>
                
                {/* Test Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReport.testType}
                    onChange={(e) => setNewReport({...newReport, testType: e.target.value})}
                    className={`w-full border ${formErrors.testType ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select test type</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="Urinalysis">Urinalysis</option>
                    <option value="Thyroid Panel">Thyroid Panel</option>
                    <option value="Lipid Panel">Lipid Panel</option>
                    <option value="Liver Function Test">Liver Function Test</option>
                  </select>
                  {formErrors.testType && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.testType}</p>
                  )}
                </div>
                
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newReport.date}
                    onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Referring Doctor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referring Doctor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReport.referringDoctor}
                    onChange={(e) => setNewReport({...newReport, referringDoctor: e.target.value})}
                    className={`w-full border ${formErrors.referringDoctor ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Dr. Sarah Johnson"
                  />
                  {formErrors.referringDoctor && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.referringDoctor}</p>
                  )}
                </div>
                
                {/* Report Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setNewReport({...newReport, reportStatus: 'Normal'})}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        newReport.reportStatus === 'Normal' 
                          ? 'bg-green-100 text-green-800 border-green-300 font-medium' 
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewReport({...newReport, reportStatus: 'Abnormal'})}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        newReport.reportStatus === 'Abnormal' 
                          ? 'bg-red-100 text-red-800 border-red-300 font-medium' 
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      Abnormal
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Findings */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Findings & Interpretation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newReport.findings}
                  onChange={(e) => setNewReport({...newReport, findings: e.target.value})}
                  className={`w-full border ${formErrors.findings ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  rows="3"
                  placeholder="Enter test findings and medical interpretation"
                ></textarea>
                {formErrors.findings && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.findings}</p>
                )}
              </div>
              
              {/* Parameters */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">
                    Test Parameters <span className="text-red-500">*</span>
                  </h3>
                  <button 
                    onClick={handleAddParameter}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Parameter
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newReport.parameters.map((param, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={param.parameter}
                              onChange={(e) => handleParameterChange(index, 'parameter', e.target.value)}
                              className={`w-full border ${
                                formErrors.parameters?.[index]?.parameter ? 'border-red-300' : 'border-gray-300'
                              } rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                              placeholder="Hemoglobin"
                            />
                            {formErrors.parameters?.[index]?.parameter && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.parameters[index].parameter}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={param.result}
                              onChange={(e) => handleParameterChange(index, 'result', e.target.value)}
                              className={`w-full border ${
                                formErrors.parameters?.[index]?.result ? 'border-red-300' : 'border-gray-300'
                              } rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                              placeholder="10.2 g/dL"
                            />
                            {formErrors.parameters?.[index]?.result && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.parameters[index].result}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={param.referenceRange}
                              onChange={(e) => handleParameterChange(index, 'referenceRange', e.target.value)}
                              className={`w-full border ${
                                formErrors.parameters?.[index]?.referenceRange ? 'border-red-300' : 'border-gray-300'
                              } rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                              placeholder="12.0-15.5"
                            />
                            {formErrors.parameters?.[index]?.referenceRange && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.parameters[index].referenceRange}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={param.status}
                              onChange={(e) => handleParameterChange(index, 'status', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Normal">Normal</option>
                              <option value="High">High</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {newReport.parameters.length > 1 && (
                              <button 
                                onClick={() => handleRemoveParameter(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormErrors({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Lab Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLabReports;