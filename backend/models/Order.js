const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Completed", "Cancelled"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI"],
      default: "Cash"
    },
    paymentDetails: {
      upiId: String,
      cardNumber: String,
      expiry: String,
      cvv: String
    },
paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },
    phone: {
      type: String
    },
    address: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);