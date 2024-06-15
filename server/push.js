const fs = require('fs');
const urlSafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');
const webpush = require('web-push');

webpush.setVapidDetails('mailto:daniel.rodriguez182@gmail.com', vapid.publicKey, vapid.privateKey);

let subscriptions = require('./subs-db.json');

const getKey = () => {
  return urlSafeBase64.decode(vapid.publicKey);
};

const addSubscription = (subscription) => {
  subscriptions.push(subscription);
  fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions));
};

const sendPush = (post) => {
  const sentNotifications = [];
  subscriptions.forEach((subs, index) => {
    const pushPromise = webpush.sendNotification(subs, JSON.stringify(post)).catch((err) => {
      if (err.statusCode === 410) {
        subscriptions[index].delete = true;
      }
    });
    sentNotifications.push(pushPromise);
  });
  Promise.all(sentNotifications).then(() => {
    subscriptions = subscriptions.filter(sub => !sub.delete);
    fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions));
  });
};

module.exports = { getKey, addSubscription, sendPush };
