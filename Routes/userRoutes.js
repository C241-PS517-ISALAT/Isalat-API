const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const router = express.Router();

// Firebase Web API Key (get this from your Firebase project settings)
const FIREBASE_WEB_API_KEY = 'Your-API-KEY';

// Get a reference to the database service
const db = admin.database();

// Sign Up User
router.post('/signup', async (req, res) => {
    const { email, password, username, phone, birthday } = req.body;

    // Check if the password meets the minimum length requirement
    if (password.length < 6) {
        return res.status(400).send({ error: 'Password must be at least 6 characters long' });
    }

    try {
        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        // Save additional user info in Realtime Database using user UID as document ID
        await db.ref('users/' + userRecord.uid).set({
            email: email,
            username: username,
            phone: phone,
            birthday: birthday,
        });

        res.status(201).send({ message: 'User created successfully', user: userRecord });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send({ error: error.message });
    }
});

// Sign In User (Email/Password)
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Sign in user using Firebase Authentication
        const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`, {
            email: email,
            password: password,
            returnSecureToken: true
        });

        const idToken = response.data.idToken;

        // Fetch additional user info from Realtime Database
        const userRecord = await admin.auth().getUserByEmail(email);
        const userSnapshot = await db.ref('users/' + userRecord.uid).once('value');
        const userData = userSnapshot.val();

        res.status(200).send({ message: 'User signed in successfully', token: idToken, user: userData });
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


// Logout User
router.post('/logout', async (req, res) => {
    const idToken = req.headers.authorization;

    try {
        // Sign out user using Firebase Authentication
        await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signOut?key=${FIREBASE_WEB_API_KEY}`, {
            idToken: idToken
        });

        res.status(200).send({ message: 'User signed out successfully' });
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