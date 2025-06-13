import express from 'express';
import {
  createTestRequest,
  getTestRequests,
  
 
  
} from '../../controllers/Labreport/Labreportappointmentcontroller.js';

import {
    getAllLabResults,
    getLabResultsByPatientId,
    createLabResult,
    
  } from '../../controllers/Labreport/Labresultcontroller.js';


const router = express.Router();

router.post('/labreport/create', createTestRequest);
router.get('/labreport/getTestRequest', getTestRequests);




// for labresult 

router.post('/labresult/create', createLabResult);
router.get('/labresult/getall', getAllLabResults);
router.get("/patient/labresult/:patientId", getLabResultsByPatientId);



export default router;