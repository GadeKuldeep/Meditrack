import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken } from '../middleware/authMiddleware.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide name, email, and password' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });

  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,                          // always true for cross-origin
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
