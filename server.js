const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const PORT = 5050

//Create app with express
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//routes  
const userRoutes= require("./routes/userAuthRoutes")
app.use("/api/user", userRoutes);
const bakerAuthRoutes = require('./routes/bakerAuthRoutes');
app.use('/api/auth/baker', bakerAuthRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

 
//error route
app.use((req, res) => {
  res.status(404).json({ success: false, message: "ROUTE NOT FOUND" });
});
//establish dbconnection with server
// mongoose.connect(process.env.MONGO_URL).then(()=> console.log("MongoDB Connected")).catch(err => console.log(err));
// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//     console.log(`server running on port : ${PORT}`);
//   });

const startServer = async () => {
    try {
      console.log("Starting server...");
      await mongoose.connect(process.env.MONGO_URL);
      console.log("mongodb connected");
      
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`server running on http://0.0.0.0:${PORT}`);
      });
      console.log("Server started successfully");           
    } catch (error) {
      console.log(error);
    }
  };
  
  startServer();
  