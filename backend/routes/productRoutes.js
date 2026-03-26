const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") && 
      (file.mimetype === "image/jpeg" || 
       file.mimetype === "image/jpg" || 
       file.mimetype === "image/png" || 
       file.mimetype === "image/webp")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, webp) are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 🔹 1. Add Product (Admin) with optional image
router.post("/add", authMiddleware, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.image = req.file.filename;
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// 🔹 2. Get All Products (Customer View)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔹 3. Update Product details (Admin) - no image
router.put("/update/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 3b. Update Product Image (Admin)
router.put("/:id/image", authMiddleware, adminOnly, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Delete old image if exists
    if (product.image) {
      const oldImagePath = path.join(uploadsDir, product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    product.image = req.file.filename;
    await product.save();
    
    res.json({ message: "Product image updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔹 4. Delete Product (Admin)
router.delete("/delete/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
