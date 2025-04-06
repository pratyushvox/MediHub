import TestRequest from '../../models/Labreport/Labreportappointmentmodel.js';

// Create a new test request
export const createTestRequest = async (req, res) => {
  try {
    const testRequest = new TestRequest({
      ...req.body,
      TestResult : 'Pending',
    });

    await testRequest.save();
    res.status(201).json({
      success: true,
      data: testRequest,
      message: 'Test request created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};


// Get all test requests
export const getTestRequests = async (req, res) => {
    try {
      const testRequests = await TestRequest.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: testRequests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };