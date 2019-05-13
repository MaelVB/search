'use strict';
// https://medium.com/robots.txt --> <loc> --> /posts/
  // <meta property="og:title" content="How to Minimize the Sales Cycle Time">
  // <meta property="og:type" content="article">

const request = require('sync-request');
const cheerio = require('cheerio');
const logger = require('../libs/logger');
const database = require('./db');
const Sequelize = require('sequelize');

async function init() {
  try {
    await database.query("TRUNCATE TABLE `metas`");
    console.log("Init terminée");
    return true;
  } catch(e) {
    console.log(e);
  }
}

async function getWebsites() {
  if(await init()){
    await database.query("SELECT `url` FROM `sites` ;", {type: Sequelize.QueryTypes.SELECT}).then(async function(sites) {
      for(let i=0;i<sites.length;i++) {
        getPages(sites[i]["url"]);
      }
    }) 
  }
}

async function getPages(url) {
  logger.info('Parsing URL [%s]', url);
  const responseRobot = request('GET', url+"robots.txt");
  const $ = cheerio.load(responseRobot.getBody());
  let robotsRaw = $('body').text();
  let robotsTab = robotsRaw.split('\n');
  let disallowTab = new Array;
  let sitemapUrl;
  let j=0;
  for(let i=0;i<robotsTab.length;i++){
    if(robotsTab[i].includes("Disallow")){
      disallowTab[j] = cutTxtLigne(robotsTab[i]);
      j++;
    } else if (robotsTab[i].includes("Sitemap")) {
      // let ligne = robotsTab[i];
      // let ligneTab = ligne.split(' ');
      // let value = ligneTab[1];
      sitemapUrl = cutTxtLigne(robotsTab[i]);
    }
    
  }

  disallowTab.forEach(function(element){
    console.log(element);
  });
  console.log("\n");
  console.log(sitemapUrl);
}

function getInfos(url) {
  logger.info('Parsing URL [%s]', url);
  const response = request('GET', url);
  const $ = cheerio.load(response.getBody());
  let metaImage = $('meta[property="og:image"]').attr('content');
  console.log(metaImage);
}

function cutTxtLigne(ligne) {
  let ligneTab = ligne.split(' ');
  let value = ligneTab[1];
  return value;
}

// function crawl(url, rawText) {
//   let urls = new Array();
//   let htmlCode = request('GET', url);
//   htmlCode.match("http[^<>]*").array.forEach(url => {
//     if (!url.test("\.xml$")) getMeta(url);
//     else if (!isInRobot(url))urls.push(url);
//   });

//   urls.forEach(url => crawl(url)); 
// }


// function makeDisallow(url) {
//   let disallow = new Array();
//   let rawText = request('GET', url);
//   let RawDisallow = rawText.match("Disallow[^(/td)]*");
//   RawDisallow.forEach(raw => disallow.push(raw.match("[^:]*$")[0]));
// }

// function isInRobotTxt(url, baseUrl) {
//   let found;
//   //disallow.forEach(d => );
// }

// function isInDisallow(parsedUrl, disallow) {
//   let parsedUrlTab = parsedUrl.slice('/');
//   let disallowTab = disallow.slice('/');

//   if(disallow.test('$$'))
  
// }

getWebsites();
