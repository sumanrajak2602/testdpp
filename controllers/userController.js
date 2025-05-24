const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Register user
// @route   POST /api/users/register
// exports.registerUser = asyncHandler(async (req, res) => {
//   const { username, email, password, role } = req.body;

//       console.log('User is getting registered');

//   const user = await User.create({
//     username,
//     email,
//     password,
//     role
//   });
//     console.log('Uploading registered success..');
//   res.status(201).json({
//     success: true,
//     token: user.generateAuthToken()
//   });
// });

exports.registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    console.log('Attempting to register user...');

    const user = await User.create({
      username,
      email,
      password,
      role,
    });

    console.log('User registration successful.');

    res.status(201).json({
      success: true,
      token: user.generateAuthToken(), // Ensure this method exists on the User model
    });

  } catch (error) {
    console.error('Error during user registration:', error);

    // Duplicate email error (MongoDB code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.',
      });
    }

    // Other validation or server errors
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message, // Optional: include for debugging
    });
  }
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