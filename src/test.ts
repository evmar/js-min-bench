import {expect} from 'chai';
import * as puppeteer from 'puppeteer';

const debug = false;

describe('todomvc', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  before(async () => {
    browser = await puppeteer.launch({headless: !debug});
    page = await browser.newPage();
    await page.goto('http://localhost:9000');
  });

  after(async () => {
    await browser.close();
  });

  it('loads', async () => {
    expect(await page.title()).to.equal('VanillaJS • TodoMVC');
  });
});
