const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/usermod');
const UserConfig = require('../models/userconfigmod');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const responseWrapper = require('../middleware/wrapper');
const auth = require('../middleware/authen');

// Multer: ตั้งค่าเก็บรูปในโฟลเดอร์ uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

async function sendConfirmationEmail({ username, email, emailToken }) { 
    const confirmUrl = `${process.env.BASE_URL}/api/users${process.env.EMAIL_CONFIRM_API}?token=${emailToken}`;    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  const htmlContent = `
    <h2>สวัสดีคุณ ${username}</h2>
    <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
    <a href="${confirmUrl}" style="
      display:inline-block;
      padding:10px 20px;
      background-color:#28a745;
      color:white;
      text-decoration:none;
      border-radius:5px;">ยืนยันอีเมล</a>
    <p>หากปุ่มใช้ไม่ได้ คลิกลิงก์นี้แทน: <a href="${confirmUrl}">${confirmUrl}</a></p>
    <p>หากคุณไม่ได้ลงทะเบียนในเว็บไซต์นี้ กรุณาเพิกเฉยต่ออีเมลนี้</p>
    <p>ขอบคุณ!</p>
    <p>ทีมงานของเรา</p>
    <p><small>หากคุณไม่สามารถคลิกปุ่มด้านบนได้ กรุณาคัดลอก URL นี้ไปวางในเบราว์เซอร์ของคุณ: ${confirmUrl}</small></p>
  `;
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "ยืนยันอีเมลของคุณ",
    html: htmlContent,
  });
  console.log('Email sent successfully');
  return true;
}

// 📧 Email confirmation router
router.get(process.env.EMAIL_CONFIRM_API || '/mailconfirm', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).send('Missing token');
    }
    const user = await User.findOne({ emailToken: token });
    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }
    user.userStatus = 'Active';
    user.emailToken = null;
    await user.save();
    res.send('Email confirmed! You can now login.');
  } catch (err) {
    res.status(500).send('Error confirming email'+ err.message);
  }
});
const upload = multer({ storage });
router.post('/signup', upload.single('avatar'), async (req, res) => {
  try {
    // 🔎 เตรียมข้อมูลจาก body
    const username = req.body.username?.trim();
    const password = req.body.password;
    const email = req.body.email?.trim();
    const phone = req.body.phone?.trim();
    const role = req.body.role?.trim();

    // ✅ ตรวจสอบ field ที่จำเป็น
    if (!username || !password || !email || !role) {
      return res.status(400).json({ result: 'fail', message: 'Missing required fields' });
    }

    // 🔍 เช็ค username/email ซ้ำ
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(201).json({ result: 'fail', message: 'Username or Email already exists' });
    }

    // 🔐 เข้ารหัส password
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;
    const ipRaw = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip = typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : ipRaw;
    const emailToken = crypto.randomBytes(32).toString('hex');
    
    const newUser = new User({
      username:username,
      password: hashedPassword,
      email:email,
      phone:phone,
      role:role,
      avatar: avatarPath,
      address: ip,
      userStatus: 'Pending',
      emailToken: emailToken
    });
    await newUser.save();
    // 📨 เรียกฟังก์ชั่น ส่งอีเมลยืนยัน ตรงนี้
    await sendConfirmationEmail({ username, email, emailToken });

    // ✅ แจ้งผลการสมัคร
    return res.status(201).json({ result: 'success', message: 'User registered! Please check your email to confirm.' });

  } catch (err) {
    return  res.status(500).json({ result: 'fail', message: err.message });
  }
});
function generateFakeToken(length = 11) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('userName,password Data: ',{username,password}); //ผ่าน 
    console.log('User: ',User); // Undefined
    // ✅ 1. ตรวจ username
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(200).json({ result: "fail", message: "Invalid username or password, contact your admin." });
    }

    // ✅ ตรวจสอบสถานะการยืนยันอีเมล
    if (!user.userStatus || user.userStatus === 'Pending') {
      return res.status(200).json({ result: "fail", message: "Please confirm your email before login." });
    }
    if (user.userStatus === 'Inactive') {
      return res.status(200).json({ result: "inactive", message: "Your account is inactive. Please contact admin." });
    }
    if (user.userStatus !== 'Active') {
      return res.status(200).json({ result: "fail", message: "Account status invalid." });
    }

    // ✅ 2. ตรวจ password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ token: generateFakeToken() ,avatar: '/uploads/'+username+'.png'}); // token ปลอม
    }

    // ✅ 3. สร้าง token จริง
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role,userId: user._id },
      JWT_SECRET,
      { expiresIn: '2d' }
    );

    // ✅ 4. เก็บ token ไว้ในคอลเลกชันแยก (user-private-config)
    await UserConfig.findOneAndUpdate(
      { userId: user._id },
      { token: token },
      { upsert: true, new: true }
    );

    return res.status(200).json({result:"success", token ,avatar: user.avatar});

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ result: "fail", message: err.message });
  }
});

router.post('/userconfig', responseWrapper(async (req, res) => {
  // ตัวอย่างการใช้ responseWrapper
  return { statusCode: 200, message: "This is a test response", data: { key: "value" } };
}));
router.get('/userconfig', responseWrapper(async (req, res) => {
  // ตัวอย่างการใช้ responseWrapper กับ GET
  return { statusCode: 200, message: "GET request successful", data: { key: "value" } };
}));

router.post('/change-password', auth, responseWrapper(async (req, res) => {
  const userId = req.user.userId; // ได้มาจาก token  
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    const error = new Error('Current password and new password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  console.log('user,userId Data: ',user,userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  // ตรวจสอบ current password (สมมติใช้ bcrypt)
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!passwordMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }
  // เข้ารหัสรหัสผ่านใหม่
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();

  return { message: 'Password changed successfully' };
}));

router.get('/getUserInfo', auth, responseWrapper(async (req, res) => {
  const userId = req.user.userId; // ได้มาจาก token ที่ auth decode ให้แล้ว

  // 🔍 ดึงจากฐานข้อมูลจริง
  const user = await User.findById(userId).select('-password'); // ไม่ส่ง password กลับ

  if (!user) {
    const error = new Error('Invalid defined user');
    error.statusCode = 401;
    throw error;
  }

  return {
    status: 200,
    result: "success",message:"user informations",
    data: user,
  };
}));


module.exports = router;
