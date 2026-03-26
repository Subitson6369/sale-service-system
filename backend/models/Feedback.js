const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
