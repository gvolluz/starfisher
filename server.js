/**
 * Starfisher - Node.js Backend Server
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const Datastore = require('nedb');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Ensure database directory exists
if (!fs.existsSync(config.dbPath)) {
  fs.mkdirSync(config.dbPath, { recursive: true });
  console.log(`Created database directory: ${config.dbPath}`);
}

// Initialize NeDB databases
const db = {
  npcs: new Datastore({ filename: path.join(config.dbPath, 'npcs.db'), autoload: true }),
  combats: new Datastore({ filename: path.join(config.dbPath, 'combats.db'), autoload: true }),
  abilities: new Datastore({ filename: path.join(config.dbPath, 'abilities.db'), autoload: true })
};

// Import data from JSON if databases are empty
async function importInitialData() {
  try {
    const jsonPath = path.join(__dirname, 'data', 'starfisherDB.json');

    // Check if the JSON file exists
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // Check if npcs database is empty
      const npcCount = await new Promise((resolve, reject) => {
        db.npcs.count({}, (err, count) => {
          if (err) reject(err);
          else resolve(count);
        });
      });

      if (npcCount === 0 && data.npcs && data.npcs.length > 0) {
        // Insert npcs data
        await new Promise((resolve, reject) => {
          db.npcs.insert(data.npcs, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`Imported ${data.npcs.length} NPCs from JSON`);
      }

      // Check if combats database is empty
      const combatCount = await new Promise((resolve, reject) => {
        db.combats.count({}, (err, count) => {
          if (err) reject(err);
          else resolve(count);
        });
      });

      if (combatCount === 0 && data.combats && data.combats.length > 0) {
        // Insert combats data
        await new Promise((resolve, reject) => {
          db.combats.insert(data.combats, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`Imported ${data.combats.length} combats from JSON`);
      }
    }
  } catch (error) {
    console.error('Error importing initial data:', error);
  }
}

// API Routes

// Get all items from a store
app.get('/api/:store', (req, res) => {
  const { store } = req.params;

  if (!db[store]) {
    return res.status(404).json({ error: `Store "${store}" does not exist` });
  }

  db[store].find({}, (err, items) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(items);
  });
});

// Get a single item by ID
app.get('/api/:store/:id', (req, res) => {
  const { store, id } = req.params;

  if (!db[store]) {
    return res.status(404).json({ error: `Store "${store}" does not exist` });
  }

  db[store].findOne({ id }, (err, item) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!item) {
      return res.status(404).json({ error: `Item with ID "${id}" not found` });
    }
    res.json(item);
  });
});

// Add a new item
app.post('/api/:store', (req, res) => {
  const { store } = req.params;
  const item = req.body;

  if (!db[store]) {
    return res.status(404).json({ error: `Store "${store}" does not exist` });
  }

  // Generate a unique ID if not provided
  if (!item.id) {
    item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  db[store].insert(item, (err, newItem) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(newItem);
  });
});

// Update an item
app.put('/api/:store/:id', (req, res) => {
  const { store, id } = req.params;
  const item = req.body;

  if (!db[store]) {
    return res.status(404).json({ error: `Store "${store}" does not exist` });
  }

  // Ensure the ID in the URL matches the ID in the body
  if (item.id && item.id !== id) {
    return res.status(400).json({ error: 'ID in URL does not match ID in request body' });
  }

  db[store].update({ id }, item, { returnUpdatedDocs: true }, (err, numAffected, updatedItem) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (numAffected === 0) {
      return res.status(404).json({ error: `Item with ID "${id}" not found` });
    }
    res.json(updatedItem);
  });
});

// Delete an item
app.delete('/api/:store/:id', (req, res) => {
  const { store, id } = req.params;

  if (!db[store]) {
    return res.status(404).json({ error: `Store "${store}" does not exist` });
  }

  db[store].remove({ id }, {}, (err, numRemoved) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (numRemoved === 0) {
      return res.status(404).json({ error: `Item with ID "${id}" not found` });
    }
    res.status(204).end();
  });
});

// Start the server
app.listen(config.port, async () => {
  console.log(`Starfisher server running on port ${config.port}`);
  await importInitialData();
});
