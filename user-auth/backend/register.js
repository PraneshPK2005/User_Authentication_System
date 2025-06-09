const { query } = require('./db/mysql_connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const [userByUsername] = await query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (userByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const [userByEmail] = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (userByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const [user] = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

module.exports = register;