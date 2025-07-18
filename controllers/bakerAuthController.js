const jwt = require('jsonwebtoken');
const Baker = require('../models/baker');

exports.verifyBaker = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const baker = await Baker.findById(decoded.id);

    if (!baker) {
      return res.status(404).json({ message: 'Baker not found' });
    }

    baker.verified = true;
    await baker.save();

    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};
