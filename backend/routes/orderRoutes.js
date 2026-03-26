const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/email");
const { adminOnly } = require("../middleware/authMiddleware");

// Add order
router.post("/add", async (req, res) => {
  try {
const { customerName, productId, quantity, paymentMethod = 'Cash', upiId, cardNumber, expiry, cvv, phone, address, email } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    product.stock -= quantity;
    await product.save();

    const amount = product.price * quantity;

    const order = new Order({
      customerName,
      product: productId,
      quantity,
      totalAmount: amount,
      status: "Pending",
      paymentMethod,
paymentDetails: { upiId, cardNumber, expiry, cvv },
      phone,
      address,
      paymentStatus: "Pending"
    });

    await order.save();

    const gst = 18;
    const totalAmount = amount + (amount * gst / 100);

    const bill = new Bill({
      customerName,
      type: "Product",
      referenceId: order._id,
      amount,
      gst,
      totalAmount,
      paymentMethod: order.paymentMethod
    });

    await bill.save();

    // Send email (non-blocking)
    try {
      const userEmail = req.body.email || 'customer@example.com';
      await sendEmail(userEmail, 'Order Confirmation', `Your order #${order._id.slice(0,8)} is Ordered for ${quantity}x ${product.name}. Total: ₹${amount}`);
      console.log('Order confirmation email sent to', userEmail);
    } catch (emailError) {
      console.log('Email send failed (continuing):', emailError.message);
    }


    res.status(201).json({
      message: "Order placed & Invoice generated",
      order,
      invoice: bill
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Orders by status
router.get("/pending", async (req, res) => {
  try {
    const orders = await Order.find({ status: "Pending" }).populate("product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revenue + Stats for admin dashboard (now includes daily chart data)
router.get("/stats", async (req, res) => {
  try {
    const orders = await Order.find().populate("product");
    const totalOrders   = orders.length;
    const pendingOrders = orders.filter(o => o.status === "Pending").length;
    const completedOrders = orders.filter(o => o.status === "Completed").length;
    
    // Total historical revenue (paid orders only)
    const paidOrders = orders.filter(o => o.paymentStatus === "Paid" || o.status === "Completed");
    const totalRevenue  = paidOrders.reduce((s, o) => s + o.totalAmount, 0);

    // Calculate daily revenue for the last 7 days
    const dailyRevenue = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyRevenue[dateStr] = 0;
    }

    paidOrders.forEach(o => {
      const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += o.totalAmount;
      }
    });

    const chartData = {
      labels: Object.keys(dailyRevenue),
      data: Object.values(dailyRevenue)
    };

    res.json({ totalOrders, pendingOrders, completedOrders, totalRevenue, chartData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete order (admin marks paid) — updates status + paymentStatus
router.put("/complete/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Completed", paymentStatus: "Paid", paymentMethod: req.body.paymentMethod || "Cash" },
      { new: true }
    ).populate("product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order completed", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status (admin)
router.put("/update-status/:id", adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate("product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
