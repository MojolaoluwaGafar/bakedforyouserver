const verifyToken = require('../middleware/verifyToken');
const Baker = require('../models/baker');

exports.verifyBaker = async (req, res, next) => {
  const { token } = req.params;

  try {
    const decoded = verifyToken(token);
    const baker = await Baker.findById(decoded.id);

    if (!baker) {
      return res.status(404).json({ message: 'Baker not found' });
    }

    if (baker.verified) {
      return res.redirect(`${process.env.CLIENT_URL}/login?verified=already`);
    }

    baker.verified = true;
    await baker.save();

    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    next({
      status: 400,
      message: err.message,
      stack: err.stack,
    });
  }
};
