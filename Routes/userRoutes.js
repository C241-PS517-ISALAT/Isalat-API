// routes/userRoutes.js
const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const router = express.Router();

// Importing verifyToken middleware from authMiddleware.js
const { verifyToken } = require('../middleware/authMiddleware');

// Firebase Web API Key (get this from your Firebase project settings)
const FIREBASE_WEB_API_KEY = 'AIzaSyAGkLEyTincM8Pp4ybAvzLzxODvFxx40k4';

// Sign Up User
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    // Check if the password meets the minimum length requirement
    if (password.length < 6) {
        return res.status(400).send({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });
        res.status(201).send({ message: 'User created successfully', user: userRecord });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Sign In User (Email/Password)
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`, {
            email: email,
            password: password,
            returnSecureToken: true
        });

        const idToken = response.data.idToken;
        res.status(200).send({ message: 'User signed in successfully', token: idToken });
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            const errorMessage = error.response.data.error.message;
            res.status(400).send({ error: errorMessage });
        } else {
            res.status(400).send({ error: 'An unknown error occurred' });
        }
    }
});

// Password Reset
router.post('/resetpassword', async (req, res) => {
    const { email } = req.body;

    try {
        const resetPasswordUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_WEB_API_KEY}`;
        
        const response = await axios.post(resetPasswordUrl, {
            requestType: "PASSWORD_RESET",
            email: email
        });

        res.status(200).send({ message: 'Password reset email sent successfully' });
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            const errorMessage = error.response.data.error.message;
            res.status(400).send({ error: errorMessage });
        } else {
            res.status(400).send({ error: 'An unknown error occurred' });
        }
    }
});

// Confirm Password Reset
router.post('/resetpassword-confirm', async (req, res) => {
    const { oobCode, newPassword } = req.body;

    try {
        const confirmPasswordResetUrl = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_WEB_API_KEY}`;

        const response = await axios.post(confirmPasswordResetUrl, {
            oobCode: oobCode,
            newPassword: newPassword
        });

        res.status(200).send({ message: 'Password has been reset successfully' });
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            const errorMessage = error.response.data.error.message;
            res.status(400).send({ error: errorMessage });
        } else {
            res.status(400).send({ error: 'An unknown error occurred' });
        }
    }
});

module.exports = router;