const mongoose = require('mongoose');
const { query } = require('./db/mysql_connection');
require('dotenv').config();

const profileSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    min: 1,
  },
  dob: {
    type: Date,
  },
  contact: {
    type: String,
    match: [/^[0-9]{10}$/, 'Contact must be 10 digits']
  }
}, { 
  timestamps: true,
  collection: 'profiles'
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

const getProfile = async (req, res) => {
  try {
    const [user] = await query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = await Profile.findOne({ userId: user.id });
    
    if (!profile) {
      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        profile: null
      });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      profile: {
        age: profile.age,
        dob: profile.dob,
        contact: profile.contact
      }
    });

  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { age, dob, contact } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        age: age !== undefined ? age : null,
        dob: dob !== undefined ? new Date(dob) : null,
        contact: contact !== undefined ? contact : null
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      age: profile.age,
      dob: profile.dob,
      contact: profile.contact
    });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ 
      message: 'Failed to update profile', 
      error: err.message,
      code: err.code 
    });
  }
};

module.exports = { getProfile, updateProfile };