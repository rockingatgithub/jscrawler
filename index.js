const URL = require("url-parse");
const cheerio = require("cheerio");
const request = require("request");

let START_URL = "https://www.python.org/";
let SEARCH_WORD = "events";
let MAX_PAGES_TO_VISIT = 20;

let pagesVisited = {};
let numPagesVisited = 0;
let pagesToVisit = [];
let url = new URL(START_URL);
let baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  let nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function (error, response, body) {
    // Check status code (200 is HTTP OK)
    console.log("Status code: " + response.statusCode);
    // console.log(body);
    if (response.statusCode !== 200) {
      callback();
      return;
    }
    // Parse the document body
    let $ = cheerio.load(body);
    let isWordFound = searchForWord($, SEARCH_WORD);
    // if (isWordFound) {
    //   console.log("Word " + SEARCH_WORD + " found at page " + url);
    // } else {
    collectInternalLinks($);
    // In this short program, our callback is just calling crawl()
    callback();
    // }
  });
}

function searchForWord($, word) {
  let bodyText = $("html > body").text().toLowerCase();
  //   console.log(bodyText);
  return bodyText.indexOf(word.toLowerCase()) !== -1;
}

function collectInternalLinks($) {
  let relativeLinks = $("a[href^='/']");
  console.log("Found " + relativeLinks.length + " relative links on page");
  relativeLinks.each(function () {
    pagesToVisit.push(baseUrl + $(this).attr("href"));
  });
}
