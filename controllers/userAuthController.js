const bcrypt =require("bcryptjs");
const jwt =require("jsonwebtoken");
const User = require("../models/User");

const generateToken = ({ userId, email }) => {
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return token;
  };

  
exports.signup= async (req, res) => {
    const { fullName, email, password } = req.body;
    
    try {
      console.log("Received signup request", req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser)
          return res.status(400).json({ message: "Email already registered" });
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = new User({
          name: fullName,
          email,
          password: hashedPassword,
        });
    
        await user.save();
    
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        console.log("Signup successful for:", email);
        res.status(201).json({ token, user: { id: user._id, name, email } });  
    } catch (error) {
      console.error("Signup error:", error);
        res.status(500).json({ message: "Signup failed", error: error.message });
  } 
}

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid email or password" });
  
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(400).json({ message: "Invalid email or password" });    
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
  
      res.json({ token, user: { id: user._id, name: user.name, email } });
    } catch (err) {
      res.status(500).json({ message: "Login failed", error: err });
    }
  };