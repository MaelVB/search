'use strict';
// https://medium.com/robots.txt --> <loc> --> /posts/
  // <meta property="og:title" content="How to Minimize the Sales Cycle Time">
  // <meta property="og:type" content="article">

const request = require('sync-request');
const cheerio = require('cheerio');
const logger = require('../libs/logger');
const database = require('./db');
const Sequelize = require('sequelize');
const annee = 2015;
let htmlTab = new Array;
let compteur = 1;

async function init() {
  try {
    await database.query("TRUNCATE TABLE `metas`");
    console.log("Init terminée");
    return true;
  } catch(e) {
    console.log(e);
  }
}

async function crawlWebsites() {
  if(await init()){
    await database.query("SELECT `url` FROM `sites` ;", {type: Sequelize.QueryTypes.SELECT}).then(async function(sites) {
      for(let i=0;i<sites.length;i++) {
        getPages(sites[i]["url"]);
      }
    }) 
  } else {
    logger.error("Erreur à l'initialisation");
  }
}

async function getPages(url) {
  htmlTab.push(url);
  let robotsTxtValues = await crawlRobotsTxt(url);
  let disallowsUrl = robotsTxtValues[0];
  let sitemapsUrl = robotsTxtValues[1];
  let xmlUrl = sitemapsUrl[0];
  let urlBase = [url];
  await crawlXml(xmlUrl); // TODO Boucle avec les sites
  htmlTab.forEach(function(element){
    getInfos(element);
  });
}

async function crawlRobotsTxt(url){
  let disallowTab = new Array;
  let sitemapsUrl = new Array;
  let j=0;
  let k=0;
  const responseRobot = request('GET', url+"robots.txt");
  const $ = cheerio.load(responseRobot.getBody());
  let robotsRaw = $('body').text(); // Contenu sans balises HTML
  let robotsTab = robotsRaw.split('\n');
  for(let i=0;i<robotsTab.length;i++){
    if(robotsTab[i].includes("Disallow") && !(robotsTab[i].startsWith("#"))){
      disallowTab[j] = cutTxtLigne(robotsTab[i]);
      j++;
    } else if (robotsTab[i].includes("Sitemap") && !(robotsTab[i].startsWith("#"))) {
        let urlR = url.substring(0, url.length-1);
        sitemapsUrl[k] = urlR+cutTxtLigne(robotsTab[i]); //TODO condition si juste slash
      k++;
    }
  }
  let returnTab = [disallowTab, sitemapsUrl];
  return returnTab;
}

async function crawlXml(xmlUrl){
        const responseSitemap = request('GET', xmlUrl);
        if((responseSitemap.statusCode !== 404)) {
          const $ = cheerio.load(responseSitemap.getBody());
          let newXmlUrlTab = $('loc').map(function() {
            return $(this).text();
          }).toArray();
          newXmlUrlTab.forEach(function(element){
            // let regle = new RegExp("^[^x]*xml$");
            if(element.endsWith(".xml")){
              crawlXml(element);
            } else if(1) {
                console.log(compteur);
                console.log(element);
                htmlTab.push(element);
                compteur++;
            } else {
              console.log("Article too old or not authorized.");
            }
          });
        } else {
          console.log("Erreur 404");
        }
}

// function recentPublish(xmlUrl) {
//   const $ = cheerio.load(xmlUrl.getBody());
//   console.log($);
//   let xmlDate = $('lastmod').map(function() {
//     console.log($(this).text());
//     return $(this).text();
//   }).toArray();

//   console.log("r");
//   xmlDate.forEach(function(element){
//     console.log(element);
//   });
// }

// async function crawlXml(xmlUrlTab){
//   if(Array.isArray(xmlUrlTab)){
//     xmlUrlTab.forEach(function(xmlUrl){
//         const responseSitemap = request('GET', xmlUrl);
//         if(responseSitemap.statusCode !== 404) {
//           const $ = cheerio.load(responseSitemap.getBody());
//           let newXmlUrlTab = $('loc').map(function() {
//             return $(this).text();
//           }).toArray();
//           newXmlUrlTab.forEach(function(element){
//             // let regle = new RegExp("^[^x]*xml$");
//             if(element.endsWith(".xml")){
//               crawlXml(element);
//             } else {
//               htmlTab.push(element);
//             }
//           });
//         } else {
//           console.log("Erreur 404");
//         }
//     });
//   }
// }

function getInfos(pageUrl) {
  // logger.info('Parsing URL [%s]', pageUrl);
  // const response = request('GET', pageUrl);
  // const $ = cheerio.load(response.getBody());
  // let metaImage = $('meta[property="og:image"]').attr('content');
  // console.log(metaImage);
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

crawlWebsites();
