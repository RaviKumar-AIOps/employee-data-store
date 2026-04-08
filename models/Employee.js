const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
  },
  residentialAddress: {
    type: String,
    required: [true, 'Residential address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  // aadharNumber: {
  //   type: String,
  //   required: [true, 'AADHAR number is required'],
  //   unique: true,
  //   trim: true,
  //   match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit AADHAR number']
  // },
  bloodGroup: {
  type: String,
  required: true,
},

aadharFile: {
  filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
},
  photo: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
employeeSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

// Index for searching
employeeSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Employee', employeeSchema);