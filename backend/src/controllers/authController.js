const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`Debug Login: Attempting login for ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`Debug Login: User not found for email ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log(`Debug Login: Password match for ${email}: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.accessFlag) {
      console.log(`Debug Login: User access disabled for ${email}`);
      return res.status(403).json({ error: 'Account disabled' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, firstLoginRequired: user.firstLoginRequired },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    console.log('Debug Login: Setting cookie for user', user.email);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // False in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Lax in dev
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    console.log('Debug Login: Sending response');
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstLoginRequired: user.firstLoginRequired
      }
    });
  } catch (err) {
    console.error('Debug Login: Error in login controller', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    console.log(`Debug UpdatePassword: User ID ${req.user.id}`);
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('Debug UpdatePassword: User not found in DB');
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.firstLoginRequired) {
      return res.status(403).json({ error: 'Password update not allowed' });
    }
    user.password = newPassword;
    user.firstLoginRequired = false;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstLoginRequired: user.firstLoginRequired,
        company: user.company // Added company just in case
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, updatePassword, checkAuth, logout };
