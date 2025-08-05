const mongoose =  require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  displayName:{type: String},
  fullName: { type: String},
  password: { type: String, required: true, select: false },
  email:    { type: String, required: true },
  phone:    String,
  role:     { type: String, enum: ['Nurse', 'Admin', 'Manager'], required: true },
  avatar:   String, // path to uploaded file

  userStatus: { type: String, enum: ['Pending', 'Active', 'Inactive'], default: 'Pending' },
  address:    String, // IP address (or later use for login tracking)
  emailToken: { type: String }, // used for email confirm or reset
  preferences: {
    language: { type: String, enum: ['th', 'en'], default: 'th' },
    timeFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
    notifyBeforeShift: { type: Number, default: 30 } // minutes
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: Date,
    loginDevices: [String]
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

const userConfigSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  token: String,
  settings: {
    ward: { type: String},
    worktype: { type: String, enum: ["Full time", "Part time","Advisor","Projective","Daily"], default: "Fullt ime" },
    overtimeRate: { type: Number, default: 0 },
    overtimeType: { type: String, enum :["Per shift","Per hours","Per job"],default: "Per shift" },
    specialShiftRate: { type: Number, default: 0 },
    shiftPerMonth: { type: Number, default: 22 },
    selectableShiftCode: {
      type: [String],
      default: ["M1", "N1", "A2"]
    }
  }
}, { timestamps: true });

// exports.UserConfig = mongoose.model('UserConfig', userConfigSchema);
module.exports = mongoose.models.UserConfig || mongoose.model('UserConfig', userConfigSchema);