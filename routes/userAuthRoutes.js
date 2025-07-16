const express = require("express");
const router = express.Router();
const { signup, signin } = require("../controllers/userAuthController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getAllBakers } = require("../controllers/adminController");



router.post("/signup", signup);
router.post("/signin", signin)
router.get("/admin/bakers", protect, authorizeRoles("admin"), getAllBakers);

module.exports = router;