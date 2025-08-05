const express = require('express');
const UserConfig  = require('../models/userconfigmod');
const router = express.Router();
const auth = require('../middleware/authen');
const responseWrapper = require('../middleware/wrapper');

router.post('/test-post', responseWrapper(async (req, res) => {
  // ตัวอย่างการใช้ responseWrapper
  return { statusCode: 200, message: "This is a test response", data: { key: "value" } };
}));
router.get('/test-get', responseWrapper(async (req, res) => {
  // ตัวอย่างการใช้ responseWrapper กับ GET
  return { statusCode: 200, message: "GET request successful", data: { key: "value" } };
}));

router.post('/save',auth, responseWrapper(async (req, res) => {
    const userId = req.user.userId; // ได้มาจาก token
    const { token, settings } = req.body;   
    if (!token || !settings) {
      const error = new Error('Token and settings are required');
      error.statusCode = 400;
      throw error;
    }
    // ตรวจสอบว่ามี UserConfig สำหรับ userId นี้หรือไม่
    let userConfig = await UserConfig.findOne({ userId });
    if (!userConfig) {
      // ถ้าไม่มี ให้สร้างใหม่
      userConfig = new UserConfig({ userId, token, settings });
    }   else {
      // ถ้ามีแล้ว ให้ปรับปรุงข้อมูล
      userConfig.token = token;
      userConfig.settings = settings;
    }   
    // บันทึก UserConfig
    await userConfig.save();            
    return { message: 'User configuration saved successfully', data: userConfig };
}));

router.get('/get',auth, responseWrapper(async (req, res) => {
  const userId = req.user.userId; // ได้มาจาก token
  // ดึงข้อมูล UserConfig สำหรับ userId นี้        
    const userConfig = await UserConfig.findOne({ userId }).populate('userId', 'username email role avatar');
    if (!userConfig) {
      const error = new Error('User configuration not found');
      error.statusCode = 404;
      throw error;
    }   
    return { message: 'User configuration retrieved successfully', data: userConfig };
}));

module.exports = router;
