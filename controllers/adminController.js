const Baker = require("../models/baker");

exports.getAllBakers = async (req, res) => {
  try {
    const bakers = await Baker.find().populate("userId", "name email");
    res.json(bakers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bakers", error: err });
  }
};
