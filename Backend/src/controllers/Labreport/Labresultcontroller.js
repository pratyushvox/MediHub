// controllers/labResultController.js

import LabResult from '../../models/Labreport/Labresultmodel.js';
import TestRequest from '../../models/Labreport/Labreportappointmentmodel.js';
import { sendNotification } from '../../controllers/Notification/Notificationcontroller.js';

// Get all lab results
export const getAllLabResults = async (req, res) => {
  try {
    const labResults = await LabResult.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: labResults.length,
      data: labResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get labresult by patient id 
export const getLabResultsByPatientId = async (req, res) => {
    try {
      const { patientId } = req.params; // Extract patientId from URL
  
      // Find lab results for this patient only, sorted by date (newest first)
      const labResults = await LabResult.find({ patientId }).sort({ date: -1 });
  
      if (labResults.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No lab results found for this patient",
        });
      }
  
      res.status(200).json({
        success: true,
        count: labResults.length,
        data: labResults,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  };

// Create new lab result


export const createLabResult = async (req, res) => {
  try {
    // First create the lab result
    const labResult = await LabResult.create(req.body);
    
    // Find the corresponding test request and update its status
    const updatedRequest = await TestRequest.findOneAndUpdate(
      {
        patientId: req.body.patientId,
        TestResult: 'Pending' // Only update if still pending
      },
      {
        TestResult: 'Done',
        updatedAt: Date.now()
      },
      {
        new: true // Return the updated document
      }
    ).populate('patientId');
    
    if (!updatedRequest) {
      console.warn('No matching pending test request found for this lab result');
    } else {
      // Send notification to patient about lab result
      const testName = labResult.testName || updatedRequest.testType || 'your medical test';
      const resultStatus = labResult.resultStatus || 'completed';
      
      let message = `Your lab report for ${testName} has been created.`;
      
      if (resultStatus.toLowerCase() === 'normal') {
        message += ' All results are normal.';
      } else if (resultStatus.toLowerCase() === 'abnormal') {
        message += ' Some results are abnormal. Please consult with your doctor.';
      }
      
      // Send notification using the same pattern as in approval/rejection
      await sendNotification(updatedRequest.patientId._id.toString(), message, 'patient');
    }
    
    res.status(201).json({
      success: true,
      data: {
        labResult,
        updatedRequest: updatedRequest || 'No matching test request updated'
      },
      message: 'Lab result created successfully' + 
        (updatedRequest ? ' and test request marked as completed' : '')
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      console.error('Error creating lab result:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};