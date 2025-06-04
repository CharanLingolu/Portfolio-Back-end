const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();

// ✅ Allow multiple origins (main + preview deployments)
const allowedOrigins = [
  "https://portfolio-tv2x.vercel.app",
  "https://portfolio-tv2x-git-main-charanlingolus-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ DB connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
  });

// Define Schema & Model
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  phoneno: String,
});

// Prevent overwrite in dev
mongoose.models = mongoose.models || {};
const Contact =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to my portfolio backend!");
});

// POST route for contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, phoneno } = req.body;

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

// 404 handler
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
