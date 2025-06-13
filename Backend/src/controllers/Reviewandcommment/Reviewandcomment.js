import mongoose from "mongoose"; 
import { Review } from "../../models/ReviewandCommentmodel/Reviewandcommentmodel.js";

import Doctor from "../../models/Doctor/Doctorsignupmodel.js";

export const createReview = async (req, res) => {
    try {
      const { doctorId, userId, userName, rating, comment } = req.body;
  
      if (!doctorId || !userId || !userName || !rating) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor ID, User ID, User Name, and rating are required' 
        });
      }
  
      // Check if rating is between 1 and 5
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
  
      // Check if the doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }
  
      // Check if the user has already reviewed this doctor
      const existingReview = await Review.findOne({ doctor: doctorId, user: userId });
      
      if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment;
        await existingReview.save();
        
        return res.status(200).json({
          success: true,
          message: 'Review updated successfully',
          data: existingReview
        });
      }
  
      // Create a new review
      const newReview = await Review.create({
        doctor: doctorId,
        user: userId,
        userName,
        rating,
        comment
      });
  
      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: newReview
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  // Get all reviews for a doctor
  export const getDoctorReviews = async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid doctor ID format'
        });
      }
      
  
      const reviews = await Review.find({ doctor: doctorId })
        .sort({ createdAt: -1 })
        .populate('user', 'name'); // Populate user info if needed
        console.log('Total reviews fetched:', reviews.length);
      res.status(200).json({
        
        success: true,
        data: reviews
      });
    } catch (error) {
      console.error('Error fetching doctor reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  // Get review statistics for a doctor
  export const getDoctorReviewStats = async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid doctor ID format'
        });
      }
  
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }
  
      // Get rating distribution
      const ratingDistribution = await Review.aggregate([
        { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]);
  
      // Format response
      const stats = {
        averageRating: doctor.averageRating || 0,
        numberOfReviews: doctor.numberOfReviews || 0,
        ratingDistribution: Array.from({ length: 5 }, (_, i) => {
          const rating = 5 - i;
          const found = ratingDistribution.find(item => item._id === rating);
          return {
            rating,
            count: found ? found.count : 0
          };
        })
      };
  
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching doctor review stats:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  // Delete a review (for admins or the user who created it)
  export const deleteReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { userId, isAdmin } = req.body; // isAdmin should be validated through middleware
      
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }
      
      // Check if user has permission to delete
      if (!isAdmin && review.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this review'
        });
      }
      
      const doctorId = review.doctor;
      await review.remove();
      
      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };


