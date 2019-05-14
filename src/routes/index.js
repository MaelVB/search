'use strict';

const express = require('express');
const routerRoot = express.Router();
const database = require('../services/db');
const Sequelize = require('sequelize');

routerRoot.get('/', function(req, res) {
  const crawler = require('../services/crawler'); //TODO crawler en CRON
  res.render('index');
});

// Health check
routerRoot.get('/ping', function(req, res) {
  res.send('PONG');
});

// monsite.com/search?q=maRequete =>  req.query.q;
// monsite.com/search/maRequete =>  req.params.q;
// routerRoot.get('/search', function(req, res) {
//   const searchQuery = req.query.search;
//   res.render('search_page', { results: searchQuery });
// });

let obj = {};
routerRoot.get('/search', function(req, res) {
  const searchQuery = req.query.search;
    database.query("SELECT `url` FROM `metas` WHERE value LIKE '"+searchQuery+"';", {type: Sequelize.QueryTypes.SELECT}).then(async function(result) {
      obj = {print: result}
      res.render('search_page', obj);
    });
});

module.exports = routerRoot;
