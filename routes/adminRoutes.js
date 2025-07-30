const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorizeRoles, isSuperAdmin } = require("../middleware/authMiddleware");

// Admin creation (super admin only)
router.post("/create-admin",protect, isSuperAdmin, adminController.createAdmin);
// Secure all admin routes
router.use(protect, authorizeRoles("admin"));


// Users & Bakers
router.get("/users", adminController.getAllUsers);
router.get("/bakers", adminController.getAllBakers);
router.get("/bakers/pending", adminController.getPendingBakers);
router.patch("/user/:userId/disable", adminController.disableUser);
router.patch("/user/:userId/enable", adminController.enableUser);
router.patch("/user/:userId/approve", adminController.approveUser);

// Products & Orders
router.get("/orders", adminController.getAllOrders);
router.get("/products", adminController.getAllProducts);

// Metrics
router.get("/metrics", adminController.getMetrics);

module.exports = router;
