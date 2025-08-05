const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const nurseRoutes = require('./routes/nurses');
const scheduleRoutes = require('./routes/schedules');
const usersRoutes = require('./routes/users');
const systemConfigRoutes = require('./routes/systemconfig');
const userConfigRoutes = require('./routes/userconfig');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/nurses', nurseRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/systemconfig', systemConfigRoutes);
app.use('/api/userconfig', userConfigRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
