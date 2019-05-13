'use strict';

const express = require('express');
const routerRoot = express.Router();

// Health check
routerRoot.get('/ping', function(req, res) {
  res.send('PONG');
});

// ?q= query
// / params
routerRoot.get('/search', function(req, res) {
  const searchQuery = req.query.q;
  res.render('search_page', { results: results });
});

module.exports = routerRoot;
