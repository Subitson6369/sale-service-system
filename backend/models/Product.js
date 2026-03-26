const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
      // Example: Computer, Printer, CCTV, Accessory
    },
    price: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      default: 0
    },
    description: {
      type: String
    },
    image: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);