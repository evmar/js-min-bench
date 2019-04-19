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

  describe('initial state', () => {
    it('loads', async () => {
      expect(await page.title()).contain('TodoMVC');
    });
    it('focuses input', async () => {
      expect(
        await page.$eval(
          'input.new-todo',
          input => input && input === document.activeElement
        )
      ).true;
    });
  });

  describe('no todos', () => {
    it('hides everything', async () => {
      const main = await page.$('.main');
      if (!main) expect(await page.$$('ul.todo-list li')).empty;
      await page.waitForSelector('footer', {visible: false});
    });
  });
});
