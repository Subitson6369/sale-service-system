const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const billingRoutes = require("./routes/billingRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Enhanced CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files - Frontend & Uploads
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/auth", authRoutes);

// Test routes
app.get("/", (req, res) => {
  res.send("🚀 Sales & Service Backend Running Successfully!");
});

app.get("/api/ping", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend running perfectly",
    timestamp: new Date(),
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Create default admin only once
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({
      email: "admin1234@gmail.com"
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin1234", 12);

      const adminUser = new User({
        name: "Super Admin",
        email: "admin1234@gmail.com",
        password: hashedPassword,
        role: "admin"
      });

      await adminUser.save();

      console.log("✅ Default admin created:");
      console.log("   📧 Email: admin1234@gmail.com");
      console.log("   🔑 Password: Admin1234");
    } else {
      console.log("✅ Admin already exists");
    }

  } catch (error) {
    console.error("❌ Admin create error:", error.message);
  }
}

// Seed sample products
async function seedSampleProducts() {
  const Product = require("./models/Product");

  try {
    const count = await Product.countDocuments();

    if (count === 0) {
      await Product.insertMany([
        {
          name: "Dell Inspiron Laptop",
          category: "Computer",
          price: 65000,
          stock: 10,
          description: "i5 12th Gen, 16GB RAM, 512GB SSD"
        },
        {
          name: "HP LaserJet Printer",
          category: "Printer",
          price: 12500,
          stock: 15,
          description: "High speed printing"
        },
        {
          name: "Hikvision CCTV Camera",
          category: "CCTV",
          price: 2800,
          stock: 25,
          description: "4MP Full HD, Night Vision"
        }
      ]);

      console.log("✅ Sample products seeded (3 products)");
    } else {
      console.log(`✅ ${count} products already exist`);
    }
  } catch (error) {
    console.error("❌ Product seeding error:", error.message);
  }
}

// MongoDB Connect Fallback Logic
const startServer = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // If no URI or the placeholder is still there, use memory server
    if (!uri || uri.includes("YOUR_MONGODB_PASSWORD")) {
      console.log("⚠️ No valid MONGO_URI found, initiating MongoDB Memory Server...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    await mongoose.connect(uri || "mongodb://localhost:27017/saleservice");
    console.log("✅ MongoDB Connected Successfully");

    await createDefaultAdmin();
    await seedSampleProducts();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Frontend: http://localhost:${PORT}`);
      console.log(`🖼️  Uploads: http://localhost:${PORT}/uploads`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    console.log("💡 Add your MONGO_URI to backend/.env");
  }
};

startServer();
