const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// 1. User Registration
router.post('/register', async (req, res) => {
    const { email, password, dob, mobileNumber } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            dob,
            mobileNumber,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. Get All Users
router.get('/', async (req, res) => {
    try {
        // Exclude passwords from the response
        const users = await User.find({}, '-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Password Reset
router.post('/resetpassword', async (req, res) => {
    const { email, mobileNumber, newPassword } = req.body;

    try {
        // Find the user
        const user = await User.findOne({ email, mobileNumber });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
