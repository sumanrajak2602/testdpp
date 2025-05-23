const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Register user
// @route   POST /api/users/register
exports.registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const user = await User.create({
    username,
    email,
    password,
    role
  });

  res.status(201).json({
    success: true,
    token: user.generateAuthToken()
  });
});

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