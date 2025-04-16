import express from 'express';
import { 
  createReview, 
  getDoctorReviews, 
  getDoctorReviewStats,
  deleteReview 
} from '../../controllers/Reviewandcommment/Reviewandcomment.js';


const router = express.Router();

// POST /api/reviews - Create a new review or update existing one
router.post('/doctor/createreview', createReview);

// GET /api/reviews/doctor/:doctorId - Get all reviews for a specific doctor
router.get('/doctor/:doctorId', getDoctorReviews);

// GET /api/reviews/stats/:doctorId - Get review statistics for a specific doctor
router.get('/stats/:doctorId', getDoctorReviewStats);

// DELETE /api/reviews/:reviewId - Delete a review (protected route)
router.delete('/:reviewId',  deleteReview);

export default router;