const express = require('express');
const admin = require('firebase-admin');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Get a reference to the database service
const db = admin.database();

// Route to update user profile
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.uid;
    const { username, phone, birthday } = req.body;

    try {
        // Update user's display name in Firebase Authentication
        await admin.auth().updateUser(userId, {
            displayName: username,
        });

        // Update additional user info in Realtime Database
        await db.ref('users/' + userId).update({
            username: username,
            phone: phone,
            birthday: birthday,
        });

        res.status(200).send({ message: 'User profile updated successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Route to get user profile
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.uid;

    try {
        const userSnapshot = await db.ref('users/' + userId).once('value');
        if (!userSnapshot.exists()) {
            return res.status(404).send({ error: 'User profile not found' });
        }

        const userData = userSnapshot.val();
        res.status(200).send({
            message: 'User profile retrieved successfully',
            user: userData
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
