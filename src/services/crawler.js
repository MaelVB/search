'use strict';

/** TODO :
 * Choisir ou pas d'alimenter à nouveau la DB
 * Sélection des pages selon les disallow et la date
 * Boucle sur plusieurs sites
 * Récupération de plusieurs types de métadata en fonction d'un tableau de données
 * Prendre en compte les spécifités de chaque site (emplacement des sitemaps, types de fichier, infos du robots.txt)
*/

const request = require('sync-request');
const cheerio = require('cheerio');
const logger = require('../libs/logger');
const database = require('./db');
const Sequelize = require('sequelize');
let JSONresult;
let htmlTab = new Array;
let metaTab = new Array;
const annee = 2015;
let compteur = 1;

crawlWebsites();

async function crawlWebsites() {
  if(await init()){
    await database.query("SELECT `url` FROM `sites` ;", {type: Sequelize.QueryTypes.SELECT}).then(async function(sites) {
      for(let i=0;i<sites.length;i++) {
        getPages(sites[i]["url"]);
      }
    }); 
  } else {
    logger.error("Erreur à l'initialisation");
  }
}

async function init() {
  try {
    await database.query("TRUNCATE TABLE `metas`");
    console.log("Init terminée");
    return true;
  } catch(e) {
    console.log(e);
  }
}

async function getPages(url) {
  htmlTab.push(url);
  let robotsTxtValues = await crawlRobotsTxt(url);
  let disallowsUrl = robotsTxtValues[0];
  let sitemapsUrl = robotsTxtValues[1];
  let xmlUrl = sitemapsUrl[0];
  let urlBase = [url];
  await crawlXml(xmlUrl); // TODO Boucle avec les sites + conditions avec les disallow

  // htmlTab.forEach(function(element){
  //   getInfos(element);
  // });
  let elmt=0;
  while(elmt<htmlTab.length && elmt<50){
    console.log(elmt);
    let eachElmnt = htmlTab[elmt];
    getInfos(eachElmnt);
    elmt++;
  }
  logger.info('Traitement terminé.');

  let metaKey = "og:title";
  metaTab.forEach(function(element){
    addMetaToDb(url,metaKey,element);
  });
  logger.info('Ajout DB effectué.');

  // JSONresult = selectResultToJson();
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
        sitemapsUrl[k] = cutTxtLigne(robotsTab[i]);
        // sitemapsUrl[k] = urlR+cutTxtLigne(robotsTab[i]); //TODO condition si juste slash
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
        console.log("Pages too old or not authorized.");
      }
    });
  } else {
    console.log("Erreur 404");
  }
}

async function getInfos(pageUrl) {
  // logger.info('Parsing URL [%s]', pageUrl);

  const response = request('GET', pageUrl);
  const $ = cheerio.load(response.getBody());
  try {
    let metaTitle = $('meta[property="og:title"]').attr('content');
    metaTab.push(metaTitle);
    // let metaType = $('meta[property="og:type"]').attr('content');
    // let metaImage = $('meta[property="og:image"]').attr('content');
    console.log(metaTitle);
  } catch (e) {
    console.log(e);
  }
}

function cutTxtLigne(ligne) {
  let ligneTab = ligne.split(' ');
  let value = ligneTab[1];
  return value;
}

async function addMetaToDb(url,metaKey,metaValue){
  await database.query("INSERT INTO `metas` (url, metaKey, value) VALUES ('"+url+"','"+metaKey+"','"+metaValue+"');");
}

// async function selectResultToJson() {
//   await database.query("SELECT `url` FROM `metas` ;", {type: Sequelize.QueryTypes.SELECT}).then(async function(metas) {
//     let jsonobj = {};
    
//   }); 
// }

// module.exports = JSONresult;
