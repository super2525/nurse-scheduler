const mongoose = require('mongoose');

const NurseSchema = new mongoose.Schema({
  name: String,
  email: String,
  unavailableDays: [String],
  shiftPreference: [String],
  maxShiftsPerWeek: Number
});

module.exports = mongoose.model('Nurse', NurseSchema);
