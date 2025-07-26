const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadMultiple } = require("../middleware/upload");

// Public route — fetch all products
router.get("/", getProducts);

// Private — Create product (with multiple images)
router.post(
  "/upload",
  protect,
  authorizeRoles("baker"),
  uploadMultiple,
  createProduct
);

// Private — Update product (with optional new images)
router.put(
  "/:id",
  protect,
  authorizeRoles("baker"),
  uploadMultiple,
  updateProduct
);

// Private — Delete product
router.delete("/:id", protect, authorizeRoles("baker"), deleteProduct);

module.exports = router;
