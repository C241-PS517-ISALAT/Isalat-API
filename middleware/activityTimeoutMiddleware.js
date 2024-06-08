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