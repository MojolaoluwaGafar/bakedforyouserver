require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require('./utils/errorHandler');

// Create app
const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", require("./routes/userAuthRoutes"));
app.use("/api/auth/baker", require("./routes/bakerAuthRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// ✅ ERROR HANDLER MIDDLEWARE COMES LAST — BEFORE 404
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "ROUTE NOT FOUND" });
});

// Server & DB connection
const startServer = async () => {
  try {
    console.log("Starting server...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
    console.log("Server started successfully");
  } catch (error) {
    console.error("Error connecting to DB:", error);
  }
};

startServer();
