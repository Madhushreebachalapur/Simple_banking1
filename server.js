// server.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve your frontend files here

// In-memory mock user data
let user = {
  customerId: 'rameshID',
  pin: '1234',
  balance: 23450,
  safeMode: true,
  frozen: false,
  transactions: [
    { id: 1, type: 'sent', amount: 500, to: 'Ramesh', date: '2025-11-10T14:42:00Z' },
    { id: 2, type: 'received', amount: 1000, from: 'Daughter', date: '2025-11-09T09:10:00Z' }
  ],
  settings: {
    language: 'en',
    textSize: 'medium',
    voiceAssist: true,
    reminders: {
      medicine: true,
      billPayment: true,
      pensionCheck: true,
    }
  }
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { customerId, pin } = req.body;
  if (customerId === user.customerId && pin === user.pin) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Get balance endpoint
app.get('/api/balance', (req, res) => {
  res.json({ balance: user.balance, safeMode: user.safeMode, frozen: user.frozen });
});

// Send money endpoint (safe mode limit 2000)
app.post('/api/send', (req, res) => {
  if (user.frozen) return res.status(403).json({ error: 'Account is frozen' });
  const { amount, recipient } = req.body;
  if (user.safeMode && amount > 2000) {
    return res.status(400).json({ error: 'Safe mode limits sending to ₹2000' });
  }
  if (amount > user.balance) return res.status(400).json({ error: 'Insufficient balance' });
  user.balance -= amount;
  user.transactions.push({ id: user.transactions.length + 1, type: 'sent', amount, to: recipient, date: new Date().toISOString() });
  res.json({ success: true, newBalance: user.balance });
});

// Get transactions
app.get('/api/transactions', (req, res) => {
  res.json({ transactions: user.transactions });
});

// Get settings
app.get('/api/settings', (req, res) => {
  res.json({ settings: user.settings, safeMode: user.safeMode });
});

// Update settings
app.post('/api/settings', (req, res) => {
  Object.assign(user.settings, req.body.settings);
  if (typeof req.body.safeMode === 'boolean') {
    user.safeMode = req.body.safeMode;
  }
  res.json({ success: true });
});

// Freeze account
app.post('/api/freeze', (req, res) => {
  user.frozen = true;
  res.json({ success: true });
});

// Unfreeze account - optional endpoint
app.post('/api/unfreeze', (req, res) => {
  user.frozen = false;
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Simple SafeBank backend running at http://localhost:${port}`);
});
