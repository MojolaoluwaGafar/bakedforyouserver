const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorizeRoles, isSuperAdmin } = require("../middleware/authMiddleware");

// Secure all admin routes
router.use(protect, authorizeRoles("admin"));

// Admin creation (super admin only)
router.post("/create-admin", isSuperAdmin, adminController.createAdmin);

// Users & Bakers
router.get("/users", adminController.getAllUsers);
router.get("/bakers", adminController.getAllBakers);
router.get("/bakers/pending", adminController.getPendingBakers);
router.patch("/baker/:id/approve", adminController.approveBaker);
router.patch("/user/:id/disable", adminController.disableUser);
router.patch("/user/:id/enable", adminController.enableUser);

// Products & Orders
router.get("/orders", adminController.getAllOrders);
router.get("/products", adminController.getAllProducts);

// Metrics
router.get("/metrics", adminController.getMetrics);

module.exports = router;
