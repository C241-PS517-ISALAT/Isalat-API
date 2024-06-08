// middleware/authMiddleware.js
const admin = require('firebase-admin');

// Middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        console.error('Authorization header is missing');
        return res.status(401).send({ error: 'Authorization header is missing' });
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    if (!idToken) {
        console.error('Token is missing');
        return res.status(401).send({ error: 'Token is missing' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Token decoded successfully:', decodedToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).send({ error: 'Unauthorized' });
    }
};

module.exports = { verifyToken };