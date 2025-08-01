const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const Nurse = require('../models/nurse');

router.post('/generate', async (req, res) => {
  const { startDate, endDate } = req.body;
  const nurses = await Nurse.find();

  const schedules = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];

    const daySchedule = {
      date: dateStr,
      shifts: {
        morning: [nurses[0]?._id],
        evening: [nurses[1]?._id],
        night: [nurses[2]?._id]
      }
    };

    schedules.push(daySchedule);
    current.setDate(current.getDate() + 1);
  }

  await Schedule.insertMany(schedules);
  res.json({ success: true, created: schedules.length });
});

module.exports = router;
