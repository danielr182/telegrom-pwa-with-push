const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');

const app = express();

const publicPath = path.resolve(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Public Directory
app.use(express.static(publicPath));

// Routes
const routes = require('./routes');
app.use('/api', routes);

app.listen(port, (err) => {
  if (err) throw new Error(err);

  console.log(`Server running in port ${port}`);
});
