const express = require("express");
const router = express.Router();
const { signup, signin } = require("../controllers/userAuthController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getAllBakers } = require("../controllers/adminController");
const { verifyEmail, resendVerificationLink } = require("../controllers/userAuthController");
const { approveBaker, approveUser } = require("../controllers/adminController");
const { isAdmin } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/verify-email/:email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationLink);
router.get("/admin/bakers", protect, authorizeRoles("admin"), getAllBakers);

router.put("/approve-baker/:id", protect, authorizeRoles("admin", "superadmin"), approveBaker);

router.put('/approve/:userId', protect, isAdmin, approveUser);


module.exports = router;