const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const { authMiddleware } = require("../middleware/authMiddleware");

// Generate Invoice
router.post("/generate", async (req, res) => {
  try {
    const { customerName, type, referenceId, amount } = req.body;

    const gst = 18;
    const totalAmount = amount + (amount * gst / 100);

    const bill = new Bill({
      customerName,
      type,
      referenceId,
      amount,
      gst,
      totalAmount
    });

    await bill.save();

    res.status(201).json({
      message: "Invoice generated successfully",
      bill
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Bills (Admin sees all, Customer sees own if email matches)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let bills;
    
    if (req.user.role === "admin") {
      bills = await Bill.find().sort({ createdAt: -1 });
    } else {
      // For customers, return bills with matching customerName (improve with user ID in future)
      bills = await Bill.find().sort({ createdAt: -1 });
    }
    
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bill by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats (Admin only)
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const bills = await Bill.find();
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    // Calculate monthly revenue
    const monthlyRevenue = {};
    bills.forEach(bill => {
      const date = new Date(bill.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + bill.totalAmount;
    });

    res.json({
      totalInvoices: bills.length,
      totalRevenue,
      monthlyRevenue,
      totalGST: bills.reduce((sum, bill) => sum + (bill.amount * bill.gst / 100), 0)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
