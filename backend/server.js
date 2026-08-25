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
    const userByEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!userByEmail) {
      return res.status(404).json({ error: 'Account does not exist' });
    }

    if (userByEmail.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`User logged in: ${email}`);
    const { password: _, ...userWithoutPassword } = userByEmail;
    
    res.status(200).json({ 
      message: 'Login successful', 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Profile Route
app.put('/api/profile', (req, res) => {
  const { userId, fullName, email } = req.body;
  
  if (!userId || !fullName || !email) {
    return res.status(400).json({ error: 'User ID, full name, and email are required' });
  }

  try {
    const update = db.prepare('UPDATE users SET fullName = ?, email = ? WHERE id = ?');
    const result = update.run(fullName, email, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User profile updated: ${email}`);
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: { id: userId, fullName, email }
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already in use by another account' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Password Route
app.put('/api/password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'User ID, current password, and new password are required' });
  }

  try {
    // Verify current password
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND password = ?').get(userId, currentPassword);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Update to new password
    const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    update.run(newPassword, userId);
    
    console.log(`User password updated: ${user.email}`);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT} with persistent SQLite database`);
});
