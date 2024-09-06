const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());

// Helper function to read the JSON file
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    throw error;
  }
}

// Helper function to write to the JSON file
async function writeDB(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database file:', error);
    throw error;
  }
}

// GET all quotes or a specific quote
app.get('/quotes/:id?', async (req, res) => {
  try {
    const db = await readDB();
    const { id } = req.params;

    if (id) {
      console.log(`Searching for quote with ID: ${id}`);
      const quote = db.quotes.find(quote => quote.id === id);
      if (!quote) {
        console.log(`Quote with ID ${id} not found`);
        return res.status(404).json({ error: 'Quote not found' });
      }
      console.log(`Found quote:`, quote);
      res.json(quote);
    } else {
      res.json(db.quotes);
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// POST a new quote
app.post('/quotes', async (req, res) => {
  try {
    const db = await readDB();
    const newQuote = {
      index: db.quotes.length,
      id: req.body.id || Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.quotes.push(newQuote);
    await writeDB(db);
    res.status(201).json(newQuote);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// PUT (update) a quote
app.put('/quotes/:id', async (req, res) => {
  try {
    const db = await readDB();
    const { id } = req.params;
    const index = db.quotes.findIndex(quote => quote.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    db.quotes[index] = { ...db.quotes[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeDB(db);
    res.json(db.quotes[index]);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// DELETE a quote
app.delete('/quotes/:id', async (req, res) => {
  try {
    const db = await readDB();
    const { id } = req.params;
    const index = db.quotes.findIndex(quote => quote.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    db.quotes.splice(index, 1);
    await writeDB(db);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Debug route to check raw database contents
app.get('/debug/db', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    res.type('json').send(data);
  } catch (error) {
    res.status(500).json({ error: 'Error reading database', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Database file location: ${DB_FILE}`);
});