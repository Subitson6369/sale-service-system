const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    email:       { type: String, required: true },
    phone:       { type: String, required: true },
    address:     { type: String },
    serviceType: { type: String, required: true },
    description: { type: String, required: true },
    preferredDate: { type: String },
    priority:    { type: String, enum: ["Normal", "High", "Emergency"], default: "Normal" },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"],
      default: "Pending"
    },
    engineerId:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    engineerName:    { type: String },
    engineerContact: { type: String },
    engineerNotes:   { type: String },
    spareParts:      [{ name: String, cost: Number }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);

