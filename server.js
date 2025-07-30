const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const nurseRoutes = require('./routes/nurses');
const scheduleRoutes = require('./routes/schedule');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/nurses', nurseRoutes);
app.use('/api/schedule', scheduleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
