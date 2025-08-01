const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/config');
const auth = require('../middleware/middleware');

// ดึง configType ต่าง ๆ
router.get('/types', async (req, res) => {
  try {

    const types = await SystemConfig.distinct('configType');
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึง configs ตาม type ที่เลือก
router.get('/type/:type', async (req, res) => {
  try {
    
    const configs = await SystemConfig.find({ configType: req.params.type });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET value + description (auto-create ถ้ายังไม่มี)
router.get('/value/:code', async (req, res) => {
  
  try {
    const result = await SystemConfig.getValue(req.params.code);
    res.json({ code: req.params.code, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET list items (auto-create ถ้ายังไม่มี)
router.get('/list/:code', async (req, res) => {
  try {
    const items = await SystemConfig.getListItems(req.params.code);
    res.json({ code: req.params.code, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET next running number in format yyyy-000001
router.get('/running/:code', async (req, res) => {
  try {
    const next = await SystemConfig.getRunningNumber(req.params.code);
    res.json({ code: req.params.code, running: next });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST insert new config
router.post('/insert', auth, async (req, res) => {
  try {
    req.body.updatedBy = req.user.username || req.user.email || "unknown";
    const config = await SystemConfig.insertConfig(req.body);
    res.status(201).json(config);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update existing config by code
//router.post('/update/:code', async (req, res) => {
router.post('/update/:code', auth, async (req, res) => {
  try {
    req.body.updatedBy = req.user.username || req.user.email || "unknown"; 

    const updated = await SystemConfig.updateConfig(req.params.code, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
