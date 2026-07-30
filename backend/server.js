const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory mock database
const users = [];

// Sign Up Route
app.post('/api/signup', (req, res) => {
  const { fullName, email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    fullName: fullName || 'Anonymous',
    email,
    password // In a real app, hash this!
  };
  
  users.push(newUser);
  console.log(`New user registered: ${email}`);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log(`User logged in: ${email}`);
  
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
});

app.listen(PORT, () => {
  console.log(`Mock Backend running on http://localhost:${PORT}`);
});
