const express = require('express');
const router = express.Router();
const Nurse = require('../models/Nurse');

router.get('/', async (req, res) => {
  const nurses = await Nurse.find();
  res.json(nurses);
});

router.post('/', async (req, res) => {
  const nurse = new Nurse(req.body);
  await nurse.save();
  res.json(nurse);
});

module.exports = router;
