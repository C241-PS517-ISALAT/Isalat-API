const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const axios = require('axios');
const serviceAccount = require('./service-account-file.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());

// Firebase Web API Key (get this from your Firebase project settings)
const FIREBASE_WEB_API_KEY = 'AIzaSyAGkLEyTincM8Pp4ybAvzLzxODvFxx40k4';

// Sign Up User
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password
    });
    res.status(201).send({ message: 'User created successfully', user: userRecord });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Sign In User
app.post('/signin', async (req, res) => {
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
    // Check for error response from Firebase API
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
  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Unauthorized' });
  }
};

// Logout User
app.post('/logout', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    await admin.auth().revokeRefreshTokens(uid);
    res.status(200).send({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Protected Route Example
app.get('/profile', verifyToken, (req, res) => {
  res.status(200).send({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
