// models/LabResult.js

import mongoose from 'mongoose';

const ParameterSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true,
    trim: true
  },
  result: {
    type: String,
    required: true,
    trim: true
  },
  referenceRange: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Normal', 'Low', 'High'],
    default: 'Normal'
  },
  action: {
    type: String,
    trim: true,
    default: ''
  }
});

const LabResultSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    trim: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  testType: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  referringDoctor: {
    type: String,
    required: true,
    trim: true
  },
  reportStatus: {
    type: String,
    enum: ['Normal', 'Abnormal'],
    required: true
  },
  findings: {
    type: String,
    trim: true
  },
  parameters: [ParameterSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const LabResult = mongoose.model('LabResult', LabResultSchema);

export default LabResult;