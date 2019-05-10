'use strict';

const express = require('express');
const routerRoot = express.Router();

// Health check
routerRoot.get('/ping', function(req, res) {
  res.send('PONG');
});

routerRoot.get('/crawler', function(req, res) {
  res.send('c');
});

module.exports = routerRoot;
