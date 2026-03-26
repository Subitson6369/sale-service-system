const express = require("express");
const router  = express.Router();
const Service = require("../models/Service");
const User    = require("../models/User");

// 1. Create Service Request
router.post("/add", async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({ message: "Service request submitted successfully", service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get All Service Requests (Admin) — with engineer populated
router.get("/", async (req, res) => {
  try {
    const services = await Service.find()
      .populate("engineerId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Assign Engineer to Service Request (Admin)
router.put("/assign/:id", async (req, res) => {
  try {
    const { engineerId, priority } = req.body;

    // Fetch engineer details to store name + contact inline
    const engineer = await User.findById(engineerId);
    if (!engineer) return res.status(404).json({ message: "Engineer not found" });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        engineerId,
        engineerName:    engineer.name,
        engineerContact: engineer.phone || engineer.email,
        priority:        priority || "Normal",
        status:          "Assigned"
      },
      { new: true }
    ).populate("engineerId", "name email phone");

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Engineer assigned successfully", service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Update Service Status (Admin)
router.put("/update/:id", async (req, res) => {
  try {
    const { status, engineerName, engineerContact } = req.body;
    const updateData = { status };
    if (engineerName)    updateData.engineerName    = engineerName;
    if (engineerContact) updateData.engineerContact = engineerContact;
    if (req.body.engineerNotes) updateData.engineerNotes = req.body.engineerNotes;
    if (req.body.spareParts)    updateData.spareParts    = req.body.spareParts;

    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (status === "Completed") {
      const sendEmail = require("../utils/email");
      sendEmail(service.email, "Service Completed",
        `Your service request is completed by ${service.engineerName || "our team"}.`);
    }

    res.json({ message: "Service updated", service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get Services for a Specific Engineer
router.get("/engineer/:id", async (req, res) => {
  try {
    const services = await Service.find({ engineerId: req.params.id })
      .populate("engineerId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;