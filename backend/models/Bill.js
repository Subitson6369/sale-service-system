const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: ["Product", "Service"],
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
      // Order ID or Service ID
    },
    amount: {
      type: Number,
      required: true
    },
    gst: {
      type: Number,
      default: 18
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", BillSchema);