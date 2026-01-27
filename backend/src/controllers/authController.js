const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.accessFlag) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, firstLoginRequired: user.firstLoginRequired },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstLoginRequired: user.firstLoginRequired
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.password = newPassword;
    user.firstLoginRequired = false;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, updatePassword };
