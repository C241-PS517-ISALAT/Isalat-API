const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const serviceAccount = require('./service-account-file.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
