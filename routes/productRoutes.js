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

// GET all products — public
router.get("/", getProducts);

// CREATE product — accepts multiple images
router.post(
  "/upload",
  protect,
  authorizeRoles("baker"),
  uploadMultiple,
  createProduct
);

// UPDATE product — optional image
router.put(
  "/:id",
  protect,
  authorizeRoles("baker"),
  uploadMultiple,
  updateProduct
);

// DELETE
router.delete("/:id", protect, authorizeRoles("baker"), deleteProduct);

module.exports = router;
