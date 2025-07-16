const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getProducts); 
router.post("/", protect, authorizeRoles("baker"), createProduct);
router.put("/:id", protect, authorizeRoles("baker"), updateProduct);
router.delete("/:id", protect, authorizeRoles("baker"), deleteProduct);

module.exports = router;
