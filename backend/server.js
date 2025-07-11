const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const stripe = require('stripe')('your_stripe_secret_key'); // Get from stripe.com dashboard
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin for auth verification
admin.initializeApp({
  credential: admin.credential.cert('path/to/firebase-service-account.json'), // Get service account from firebase console
});

// MongoDB connection
mongoose.connect('mongodb://localhost/mediator', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors());
app.use(express.json());

// Schemas
const userSchema = new mongoose.Schema({ phone: String });
const User = mongoose.model('User', userSchema);

const disputeSchema = new mongoose.Schema({
  creator: String,
  parties: [String],
  submissions: [{ party: String, truth: String, paid: Boolean }],
  status: String,
  verdict: String
});
const Dispute = mongoose.model('Dispute', disputeSchema);

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
};

// Routes
app.post('/dispute', authMiddleware, async (req, res) => {
  const dispute = new Dispute({ creator: req.user.phone, parties: [req.user.phone], status: 'pending' });
  await dispute.save();
  res.json({ id: dispute._id, link: `http://localhost:3000/dispute/${dispute._id}` });
});

app.post('/join/:id', authMiddleware, async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute.parties.includes(req.user.phone)) {
    dispute.parties.push(req.user.phone);
    await dispute.save();
  }
  res.json({ success: true });
});

app.post('/submit/:id', authMiddleware, async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  const { truth } = req.body;
  const submission = dispute.submissions.find(s => s.party === req.user.phone);
  if (submission) {
    submission.truth = truth;
  } else {
    dispute.submissions.push({ party: req.user.phone, truth, paid: false });
  }
  await dispute.save();
  res.json({ success: true });
});

app.post('/pay/:id', authMiddleware, async (req, res) => {
  const { token } = req.body;
  try {
    await stripe.charges.create({ amount: 100, currency: 'usd', source: token, description: 'Dispute Fee' });
    const dispute = await Dispute.findById(req.params.id);
    const submission = dispute.submissions.find(s => s.party === req.user.phone);
    submission.paid = true;
    if (dispute.submissions.every(s => s.paid) && dispute.submissions.length === dispute.parties.length) {
      // Call Grok API
      const prompt = 'Analyze: ' + dispute.submissions.map(s => s.truth).join(' ') + '. Suggest fair verdict.';
      const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-3-beta',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: { 'Authorization': `Bearer your_grok_api_key` } // Get from x.ai/api
      });
      const verdict = response.data.choices[0].message.content;
      dispute.verdict = verdict;
      dispute.status = 'resolved';
      await dispute.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/dispute/:id', authMiddleware, async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  res.json(dispute);
});

app.listen(5000, () => console.log('Server running'));
