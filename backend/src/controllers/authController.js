import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      username: name || email.split('@')[0],
      role: 'patient', // self-registration is always as a patient
    });

    const token = generateToken(user._id);
    return res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Registration failed.' });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    return res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Login failed.' });
  }
}

// GET /api/auth/me
export async function me(req, res) {
  return res.json({ user: req.user.toPublicJSON() });
}
