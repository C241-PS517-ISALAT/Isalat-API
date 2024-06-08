const express = require('express');
const admin = require('firebase-admin');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Initialize Firestore
const db = admin.firestore();

// Route to update user profile
router.post('/profile', verifyToken, async (req, res) => {
    const userId = req.user.uid;
    const { username, phone, birthday } = req.body;

    try {
        // Update user's display name in Firebase Authentication
        await admin.auth().updateUser(userId, {
            displayName: username,
        });

        // Update additional user info in Firestore
        await db.collection('users').doc(userId).set({
            username: username,
            phone: phone,
            birthday: birthday,
        }, { merge: true }); // Use merge to update only specified fields

        res.status(200).send({ message: 'User profile updated successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Route for user profile
router.get('/profile', verifyToken, async (req, res) => {
    const userId = req.user.uid;
  
    try {
      const userRecord = await admin.auth().getUser(userId);
      const { email, displayName, phoneNumber, birthday } = userRecord; // Assuming birthday is saved in a custom claim
  
      res.status(200).send({
        message: 'User profile retrieved successfully',
        user: { email, displayName, phoneNumber, birthday }
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

module.exports = router;
