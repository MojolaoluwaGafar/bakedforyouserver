const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const verifyToken = require('../middleware/verifyToken');

router.post('/initialize', verifyToken, initializePayment);
router.post('/verify', verifyPayment);

module.exports = router;
