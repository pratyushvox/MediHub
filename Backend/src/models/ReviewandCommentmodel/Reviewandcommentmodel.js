import mongoose from 'mongoose';
import Doctor from '../../models/Doctor/Doctorsignupmodel.js'
import User from '../../models/Usermodel/userModel.js';

// Review Schema
const reviewSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating when a review is added or updated
reviewSchema.statics.calculateAverageRating = async function(doctorId) {
  const result = await this.aggregate([
    {
      $match: { doctor: doctorId }
    },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (result.length > 0) {
      await Doctor.findByIdAndUpdate(doctorId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal place
        numberOfReviews: result[0].numberOfReviews
      });
    } else {
      await Doctor.findByIdAndUpdate(doctorId, {
        averageRating: 0,
        numberOfReviews: 0
      });
    }
  } catch (err) {
    console.error('Error updating doctor rating:', err);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.doctor);
});

// Call calculateAverageRating before remove
reviewSchema.pre('remove', function() {
  this.constructor.calculateAverageRating(this.doctor);
});

export const Review = mongoose.model('Review', reviewSchema);