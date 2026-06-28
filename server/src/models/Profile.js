const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileSchema = new Schema(
  {
    gender: {
      type: String,
      enum: ['male', 'female', 'other'], // restricts to specific values
      required: false,
      default: 'other',
    },
    contactNo: {
      type: String,
      required: false,
      trim: true,
    },
    dob: {
      type: Date,
      required: false,
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

module.exports = mongoose.model('Profile', profileSchema);