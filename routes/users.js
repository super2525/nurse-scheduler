const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User').User;
const UserConfig = require('../models/User').UserConfig;
const jwt = require('jsonwebtoken');

const router = express.Router();

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
      return res.status(409).json({ result: 'fail', message: 'Username or Email already exists' });
    }

    // 🔐 เข้ารหัส password
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 📸 Path รูป
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

    // 🌐 ดึง IP address
    const ipRaw = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip = typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : ipRaw;

    // 📝 สร้าง user ใหม่
    const newUser = new User({
      username:username,
      password: hashedPassword,
      email:email,
      phone:phone,
      role:role,
      avatar: avatarPath,
      address: ip
      // userStatus: default เป็น "0"
      // createDate: default เป็น Date.now
    });
    console.log('newUser Data: ',newUser);
    await newUser.save();

    return res.status(201).json({ result: 'success', message: 'User registered' });
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
    // ✅ 1. ตรวจ username
    const user = await User.findOne({username}).lean();

    if (!user) {
      return res.status(401).json({ result: "fail", message: "Invalid username or password, contact your admin." });
    }

    // ✅ 2. ตรวจ password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ token: generateFakeToken() ,avatar: '/uploads/'+username+'.png'}); // token ปลอม
    }

    // ✅ 3. สร้าง token จริง
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2d' }
    );

    // ✅ 4. เก็บ token ไว้ในคอลเลกชันแยก (user-private-config)
    await UserConfig.findOneAndUpdate(
      { userId: user._id },
      { token: token },
      { upsert: true, new: true }
    );

    return res.status(200).json({ token ,avatar: user.avatar});

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ result: "fail", message: err.message });
  }
});

module.exports = router;
