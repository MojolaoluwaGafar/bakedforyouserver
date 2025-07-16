const bcrypt =require("bcryptjs");
const jwt =require("jsonwebtoken");
const User = require("../models/user");

const generateToken = ({ userId, email }) => {
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return token;
  };

  
  exports.signup = async (req, res) => {
    const { fullName, email, password, role = "user" } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const assignedRole = role === "admin" ? "user" : role;

      const user = new User({
        fullName,
        email,
        password: hashedPassword,
        role: assignedRole,
      });

      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed", error: error.message });
    }
  };
  

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

