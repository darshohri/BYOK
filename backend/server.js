const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('database.sqlite');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Sign Up Route
app.post('/api/signup', (req, res) => {
  const { fullName, email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const insert = db.prepare('INSERT INTO users (id, fullName, email, password) VALUES (?, ?, ?, ?)');
    const id = Date.now().toString();
    const finalFullName = fullName || 'Anonymous';
    
    insert.run(id, finalFullName, email, password);
    console.log(`New user registered: ${email}`);
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: { id, fullName: finalFullName, email } 
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'User already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`User logged in: ${email}`);
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ 
      message: 'Login successful', 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT} with persistent SQLite database`);
});
