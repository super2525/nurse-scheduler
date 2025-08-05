const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    String,
  role:     { type: String, enum: ['Nurse', 'Admin', 'Manager'], required: true },
  avatar:   String, // path to uploaded file

  userStatus: { type: String, default: 'Pending' }, // 0 = Inactive
  address:    String, // IP address
  emailToken: { type: String, unique: true }, // Token for email confirmation
  createDate: { type: Date, default: () => new Date() } // Always set to current date/time
});

exports.User = mongoose.model('User', userSchema);

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

exports.UserConfig = mongoose.model('UserConfig', userConfigSchema);