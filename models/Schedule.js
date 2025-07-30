const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  date: String,
  shifts: {
    morning: [mongoose.Schema.Types.ObjectId],
    evening: [mongoose.Schema.Types.ObjectId],
    night: [mongoose.Schema.Types.ObjectId]
  }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
