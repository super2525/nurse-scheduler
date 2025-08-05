// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  fullName: { type: String },
  password: { type: String, required: true, select: false },
  email: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['Nurse', 'Admin', 'Manager'], required: true },
  avatar: String,
  userStatus: { type: String, enum: ['Pending', 'Active', 'Inactive'], default: 'Pending' },
  address: String,
  emailToken: { type: String },
  preferences: {
    language: { type: String, enum: ['th', 'en'], default: 'th' },
    timeFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
    notifyBeforeShift: { type: Number, default: 30 }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: Date,
    loginDevices: [String]
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;