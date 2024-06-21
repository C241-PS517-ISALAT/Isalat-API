const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.database();

// Route to get dataset by letter
router.get('/:letter', async (req, res) => {
  const letter = req.params.letter;

  try {
    const ref = db.ref(`Dataset/${letter}`);
    ref.once('value', (snapshot) => {
      if (snapshot.exists()) {
        res.status(200).send(snapshot.val());
      } else {
        res.status(404).send({ error: 'Data not found' });
      }
    }, (error) => {
      res.status(500).send({ error: 'Error fetching data', details: error.message });
    });
  } catch (error) {
    res.status(500).send({ error: 'Error fetching data', details: error.message });
  }
});

module.exports = router;
