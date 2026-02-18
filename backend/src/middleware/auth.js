const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Debug Auth: No token found in cookies or header');
      return res.status(401).json({ error: 'Please authenticate.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    // console.log('Debug Auth: User authenticated', decoded.id);
    next();
  } catch (e) {
    console.log('Debug Auth: Token verification failed:', e.message);
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Access denied.' });
  }
  next();
};

module.exports = { auth, admin };
