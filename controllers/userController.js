const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Register user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    console.log('User is getting registered');

    // Optional: Check if required fields are present
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }

    // Optional: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role
    });

    console.log('User registered successfully');

    res.status(201).json({
      success: true,
      token: user.generateAuthToken()
    });

  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { registerUser };

// @desc    Login user
// @route   POST /api/users/login
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
console.log("successful login");
  res.json({
    success: true,
    token: user.generateAuthToken()
  });
});

// @desc    Get current user
// @route   GET /api/users/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});