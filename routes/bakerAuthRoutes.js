const express = require('express');
const router = express.Router();
const { verifyBaker } = require('../controllers/bakerAuthController');

router.get('/verify/:token', verifyBaker);


module.exports = router;
