const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const serviceAccount = require('Path-service-account');


// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'Link-to-Firebase'
});

const db = admin.firestore();

const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const datasetRoutes = require('./routes/datasetRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/profile', profileRoutes)
app.use('/dataset', datasetRoutes);

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
