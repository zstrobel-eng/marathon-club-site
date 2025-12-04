// import puppeteer from 'puppeteer';
const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });

  //   open new tab in browser
  const page = await browser.newPage();

  // go to site to be tested

  await page.goto("https://marathon-club-site.web.app/index.html");

  //   click burger
  await page.click("body > nav > div.navbar-brand > a.navbar-burger");

  //   click the sign in btn

  await page.click("#signInBtn");

  //   provide email and password to sign in ... type(HTMLID, value)
  await page.type("#signInEmail", "zstrobel@wisc.edu");
  await page.type("#signInPassword", "zstrobel@wisc.edu");

  //   click the submit btn
  await page.click("#signInForm > footer > button");
  //   unique selector for submit btn

  //   force a one second delay
  await new Promise((r) => setTimeout(r, 1000));

  //   click admin page link
  await page.click("#navMenu > div.navbar-start > a.navbar-item.adminNav");

  //   click create event button
  await page.click("#createEvent");

  //   fill in event info
  await page.type("#eventID", "12345678");
  await page.type("#eventDate", "12252024");
  await page.type("#eventTime", "1000AM");
  await page.type("#eventTitle", "Test Event");
  await page.type("#eventDescription", "This is a test event.");

  //   click submit event button
  await page.click("#submitEvent");

  //   click burger
  await page.click("body > nav > div.navbar-brand > a.navbar-burger");

  //   click calendar link
  await page.click("#navMenu > div.navbar-start > a:nth-child(4)");

  //   //   search for a specific car using element ID search_bar
  //   await page.type("#search_bar", "Random Car");

  //   await page.click("#search_button");

  //   close the browser after 10 seconds
  await new Promise((r) => setTimeout(r, 10000));

  browser.close();
}

//

go();
