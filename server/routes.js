// Routes.js - Route module
const Router = require('express');
const push = require('./push');

const router = Router();

const messages = [];

// Get messages
router.get('/', function (req, res) {
  res.status(200).json(messages);
});

// Post message
router.post('/', function (req, res) {
  const message = {
    _id: req.body._id,
    message: req.body.message,
    user: req.body.user,
    lat: req.body.lat,
    lng: req.body.lng,
    photo: req.body.photo,
  };
  messages.push(message);
  res.status(200).json({
    ok: true,
    message: 'Request made correctly.',
  });
});

// Save subscription
router.post('/subscribe', function (req, res) {
  const subscription = req.body;

  push.addSubscription(subscription);

  res.status(200).json({
    ok: true,
    message: 'Subscribe made correctly.',
  });
});

// Save subscription
router.get('/key', function (req, res) {
  const key = push.getKey();
  res.send(key);
});

// Send push notification
router.post('/push', function (req, res) {
  const post = {
    title: req.body.title,
    body: req.body.body,
    user: req.body.user,
  };

  push.sendPush(post);

  res.status(200).json({
    ok: true,
    message: 'Push made correctly.',
  });
});

module.exports = router;
