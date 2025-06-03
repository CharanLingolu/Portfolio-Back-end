const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();

// ✅ Log Mongoose version
console.log("✅ Mongoose version:", mongoose.version);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (modern)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ DB connected"))
  .catch(err => {
    console.error("❌ DB connection error:", err.message);
  });

// Define Schema & Model
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  phoneno: String
});

// ✅ Prevent Overwrite in Dev (Optional but Safe)
mongoose.models = mongoose.models || {};
const Contact = mongoose.models.Contact || mongoose.model("Contact", ContactSchema);

// ✅ Add root GET route to respond to "/"
app.get("/", (req, res) => {
  res.send("Welcome to my portfolio backend!");
});

// POST route for Contact Form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, phoneno } = req.body;

    // Simple validation
    if (!name || !email || !message || !phoneno) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const contact = new Contact({ name, email, message, phoneno });
    await contact.save();

    console.log("✅ Contact saved to MongoDB");
    res.status(201).json({ message: "Message sent successfully!" });

  } catch (err) {
    console.error("❌ Error saving to MongoDB:", err.message);
    res.status(500).json({ error: "Error saving contact info" });
  }
});

// Optional: 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));