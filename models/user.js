const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    String,
  role:     { type: String, enum: ['Nurse', 'Admin', 'Manager'], required: true },
  avatar:   String, // path to uploaded file

  userStatus: { type: String, default: '0' }, // 0 = Inactive
  address:    String, // IP address
  createDate: { type: Date, default: Date.now } // ISODate
});

exports.User = mongoose.model('User', userSchema);

const userPrivateConfigSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  token: String,
  settings: {
    ward: { type: String},
    worktype: { type: String, enum: ["fulltime", "parttime","advisor","projective","daily"], default: "fulltime" },
    overtimeRate: { type: Number, default: 0 },
    overtimeType: { type: String, default: "perShift" },
    specialShiftRate: { type: Number, default: 0 },
    shiftPerMonth: { type: Number, default: 22 },
    selectableShiftCode: {
      type: [String],
      default: ["M1", "N1", "A2"]
    }
  }
}, { timestamps: true });

exports.UserConfig = mongoose.model('UserConfig', userPrivateConfigSchema);