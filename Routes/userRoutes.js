const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const axios = require('axios');

// Firebase Web API Key (get this from your Firebase project settings)
const FIREBASE_WEB_API_KEY = 'AIzaSyAGkLEyTincM8Pp4ybAvzLzxODvFxx40k4';

// Sign Up User
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Check if the password meets the minimum length requirement
  if (password.length < 8) {
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

// Middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return res.status(401).send({ error: 'Authorization header is missing' });
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Unauthorized' });
    }
};

// Middleware to update user's last activity timestamp
const updateLastActivity = async (req, res, next) => {
    // Update user's last activity timestamp in the session state
    req.session.lastActivity = Date.now();
    next();
};

// Middleware to check session timeout
const checkSessionTimeout = async (req, res, next) => {
    const sessionTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
    const currentTime = Date.now();
    const lastActivityTime = req.session.lastActivity || 0;

    // Check if session has timed out
    if (currentTime - lastActivityTime > sessionTimeout) {
        // Invalidate session and require reauthentication
        req.session.destroy();
        return res.status(401).send({ error: 'Session timeout. Please sign in again.' });
    }

    // Reset last activity timestamp
    req.session.lastActivity = currentTime;
    next();
};

// Route for user profile
router.get('/profile', verifyToken, async (req, res) => {
    // Retrieve user information based on the request (e.g., from a JWT token)
    const userId = req.user.uid;

    try {
        const userRecord = await admin.auth().getUser(userId);

        // Extract the email and displayName (username) from the user record
        const { email} = userRecord;

        res.status(200).send({ 
            message: 'User profile retrieved successfully', 
            user: { email } // Include email and username in the response
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
module.exports.verifyToken = verifyToken;
