'use strict';
// https://medium.com/robots.txt --> <loc> --> /posts/
  // <meta property="og:title" content="How to Minimize the Sales Cycle Time">
  // <meta property="og:type" content="article">

const request = require('sync-request');
const cheerio = require('cheerio');
const logger = require('../libs/logger');

let disallow;

function getInfos(url) {
  logger.info('Parsing URL [%s]', url);
  const response = request('GET', url);
  const $ = cheerio.load(response.getBody());
  // TODO extraire les meta data et les stocker dans la base de donnee
  

}

function crawl(url, rawText) {
  let urls = new Array();
  let htmlCode = request('GET', url);
  htmlCode.match("http[^<>]*").array.forEach(url => {
    if (!url.test("\.xml$")) getMeta(url);
    else if (!isInRobot(url))urls.push(url);
  });

  urls.forEach(url => crawl(url)); 
}

function getMeta(url) {


}

function makeDisallow(url) {
  let disallow = new Array();
  let rawText = request('GET', url);
  let RawDisallow = rawText.match("Disallow[^(/td)]*");
  RawDisallow.forEach(raw => disallow.push(raw.match("[^:]*$")[0]));
}

function isInRobotTxt(url, baseUrl) {
  let found;
  //disallow.forEach(d => );
}

function isInDisallow(parsedUrl, disallow) {
  let parsedUrlTab = parsedUrl.slice('/');
  let disallowTab = disallow.slice('/');

  if(disallow.test('$$'))
  
}


