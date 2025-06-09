const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDB } = require('./db/mysql_connection');
const connectMongoDB = require('./db/mongo_connection');
const register = require('./register');
const login = require('./login');
const { getProfile, updateProfile } = require('./profile_update');
const { protect } = require('./authMiddleware');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const initializeDatabases = async () => {
  try {
    await initDB();
    await connectMongoDB();
    console.log('Databases initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
};

app.post('/register', register);
app.post('/login', login);
app.get('/profile', protect, getProfile);
app.put('/profile', protect, updateProfile);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

initializeDatabases().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});