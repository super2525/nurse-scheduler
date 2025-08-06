// models/UserConfig.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userConfigSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  token: String,
  settings: {
    ward: { type: String },
    worktype: { type: String, enum: ["Full time", "Part time", "Advisor", "Projective", "Daily"], default: "Full time" },
    overtimeRate: { type: Number, default: 0 },
    overtimeType: { type: String, enum: ["Per shift", "Per hours", "Per job", 'Per Piece'], default: "Per shift" },
    specialShiftRate: { type: Number, default: 0 },
    shiftPerMonth: { type: Number, default: 22 },
    selectableShiftCode: {
      type: [String],
      default: ["M1", "N1", "A2"]
    }
  }
}, { timestamps: true });

const UserConfig = mongoose.models.UserConfig || mongoose.model('UserConfig', userConfigSchema);
module.exports = UserConfig;