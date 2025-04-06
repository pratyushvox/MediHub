import React, { useState } from 'react';
import { User, CreditCard, Calendar, FileText, PlusCircle, X, ChevronDown } from 'lucide-react';

const ClinicTestRequestForm = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    dob: '',
    gender: '',
    contactNumber: '',
    testType: 'X-ray',
    bodyPart: '',
    referringDoctor: '',
    urgency: 'Routine',
    paymentMethod: 'Cash',
    price: '',
    notes: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const testTypes = [
    'X-ray', 
    'MRI', 
    'CT Scan', 
    'Ultrasound', 
    'Blood Test',
    'ECG',
    'Other'
  ];

  const bodyParts = [
    'Chest', 'Abdomen', 'Skull', 'Spine', 
    'Arm', 'Leg', 'Pelvis', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consent) {
      alert('Please confirm consent before submitting');
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      // Format the data before sending
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price) || 0, // Ensure it's a number
        dob: new Date(formData.dob).toISOString() // Format date properly
      };
  
      const response = await fetch('http://localhost:4000/api/labreport/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Explicitly ask for JSON response
        },
        body: JSON.stringify(submissionData)
      });
  
      // First check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Server returned non-JSON response');
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
  
      alert('Lab report created successfully!');
      console.log('Lab report created:', data);
      
      // Reset form after successful submission
      setFormData({
        patientId: '',
        patientName: '',
        dob: '',
        gender: '',
        contactNumber: '',
        testType: 'X-ray',
        bodyPart: '',
        referringDoctor: '',
        urgency: 'Routine',
        paymentMethod: 'Cash',
        price: '',
        notes: '',
        consent: false
      });
  
    } catch (err) {
      // Handle different types of errors
      let errorMessage = err.message;
      
      // If it's HTML error content, extract meaningful part
      if (err.message.startsWith('<!DOCTYPE html>')) {
        errorMessage = 'Server returned an error page. Check your API endpoint.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Failed to connect to the server. Is it running?';
      }
      
      setError(errorMessage);
      console.error('Error creating lab report:', err);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <FileText className="mr-2" /> Clinic Test Request Form
      </h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Patient Information Section */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" /> Patient Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Test Information Section */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Test Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({...formData, testType: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >
                {testTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {(formData.testType === 'X-ray' || formData.testType === 'MRI' || formData.testType === 'CT Scan') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Part</label>
                <select
                  value={formData.bodyPart}
                  onChange={(e) => setFormData({...formData, bodyPart: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select body part</option>
                  {bodyParts.map((part) => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referring Doctor</label>
              <input
                type="text"
                value={formData.referringDoctor}
                onChange={(e) => setFormData({...formData, referringDoctor: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Routine">Routine (24-48 hrs)</option>
                <option value="Urgent">Urgent (4 hrs)</option>
                <option value="STAT">STAT (Immediate)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Special instructions, clinical history, etc."
            ></textarea>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5" /> Payment Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Fone Pay">Fone Pay</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (NRs)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">NRs</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2 pl-12 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Consent Section */}
        <div className="mb-6 flex items-start">
          <input
            type="checkbox"
            id="consent"
            checked={formData.consent}
            onChange={(e) => setFormData({...formData, consent: e.target.checked})}
            className="mt-1 mr-2"
            required
          />
          <label htmlFor="consent" className="text-sm text-gray-700">
            I confirm that the patient has consented to this procedure and all information provided is accurate.
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!formData.consent || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClinicTestRequestForm;