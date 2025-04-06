// controllers/labResultController.js

import LabResult from '../../models/Labreport/Labresultmodel.js';
import TestRequest from '../../models/Labreport/Labreportappointmentmodel.js';

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

// Get single lab result
export const getLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.findById(req.params.id);
    
    if (!labResult) {
      return res.status(404).json({
        success: false,
        error: 'Lab result not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: labResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new lab result


export const createLabResult = async (req, res) => {
  try {
    // First create the lab result
    const labResult = await LabResult.create(req.body);
    
    // Find the corresponding test request and update its status
    // Assuming patientId and testType can be used to match the request
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
    );

    if (!updatedRequest) {
      console.warn('No matching pending test request found for this lab result');
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