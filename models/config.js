// models/SystemConfig.js
const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema({
  configType: { type: String, required: true },
  configCode: { type: String, required: true, unique: true },
  configDescription: { type: String },
  configValue: { type: String, default: "" }, // เก็บค่า config ปกติ หรือ ค่า running number (ในรูป string)  

  items: {
    type: [
      {
        value: String,
        label: String,
        status: {type:Boolean, default: true},
      }
    ],
    default: []
  },

  lastUpdate: { type: Date, default: Date.now },
});

// ก่อน save ให้ตั้ง lastUpdate เป็นเวลาปัจจุบันเสมอ
systemConfigSchema.pre("save", function (next) {
  this.lastUpdate = new Date();
  next();
});

// Static methods
systemConfigSchema.statics = {
  // ดึงค่า configValue (เหมาะกับกรณีค่าตัวเดียว)
  // ✅ GET VALUE - auto insert if not found
  async getValue(configCode) {
    let config = await this.findOne({ configCode });

    if (!config) {
      config = await this.create({
        configCode,
        configType: configCode,
        configDescription: "🔴 AUTO-GENERATED: please set manually",
        configValue: -99,
      });
    }

    return {
      value: config.configValue,
      description: config.configDescription
    };
  },

  // ✅ GET ITEMS - auto insert if not found
  async getListItems(configCode) {
    let config = await this.findOne({ configCode });

    if (!config) {
      config = await this.create({
        configCode,
        configType: configCode,
        configDescription: "🔴 AUTO-GENERATED list: please set items",
        items: [{ value: "genesis", label: "Genesis Item", status: true }],
      });
    }

    return (config.items || []).filter(item => item.status !== false);
  },

  // ✅ GET RUNNING - auto insert if not found
  async getRunningNumber(configCode) {
    const year = new Date().getFullYear().toString();
    const config = await this.findOne({ configCode });

    if (!config) {
      await this.create({
        configCode,
        configType: configCode,
        configDescription: "🔴 AUTO-GENERATED running number",
        configValue: 1,
        lastUpdate: new Date(),
      });
      return `${year}-000001`;
    }

    const lastYear = config.lastUpdate.getFullYear().toString();
    let next = (year !== lastYear) ? 1 : parseInt(config.configValue || 1) + 1;

    config.configValue = next;
    config.lastUpdate = new Date();
    await config.save();

    return `${year}-${String(next).padStart(6, "0")}`;
  },

  // Insert config ใหม่ ไม่ให้ซ้ำ configCode
  async insertConfig(configData) {
    const exists = await this.findOne({ configCode: configData.configCode });
    if (exists) throw new Error(`Config with code '${configData.configCode}' already exists.`);
    const config = new this(configData);
    await config.save();
    return config;
  },

  // Update config ตาม configCode
  async updateConfig(configCode, updates) {
    const config = await this.findOne({ configCode });
    if (!config) throw new Error(`Config '${configCode}' not found.`);
    Object.assign(config, updates);
    await config.save();
    return config;
  },
};

module.exports = mongoose.model("SystemConfig", systemConfigSchema);
