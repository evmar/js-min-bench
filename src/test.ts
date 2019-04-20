import {expect} from 'chai';
import * as puppeteer from 'puppeteer';

const debug = false;

const newInputSelector = 'input.new-todo';

/** Gets the text of the displayed todo items. */
async function getItems(page: puppeteer.Page) {
  return await page.$$eval('ul.todo-list li', es => es.map(e => e.textContent));
}

/** Gets the completed state of the displayed todo items. */
async function getItemsCompleted(page: puppeteer.Page) {
  return await page.$$eval('ul.todo-list li', es => es.map(e => e.classList.contains('completed')));
}

/** Gets the toggles of the displayed todo items. */
async function getItemsToggles(page: puppeteer.Page) {
  return await page.$$('ul.todo-list li input.toggle');
}

/** Adds a todo item by typing it in. */
async function addItem(page: puppeteer.Page, text: string) {
  const input = (await page.$(newInputSelector))!;
  await input.focus();
  await page.keyboard.type(text);
  await page.keyboard.press('Enter');
}

/** Checks whether a given element is visible or not. */
async function isVisible(
  page: puppeteer.Page,
  selector: string,
  visible: boolean
): Promise<boolean> {
  const elem = await page.$(selector);
  if (!elem) return !visible;
  // TODO: check visibility?
  return visible;
}

describe('todomvc', function() {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  before(async function() {
    browser = await puppeteer.launch({headless: !debug});
    page = await browser.newPage();
    await page.goto('http://localhost:9000');
  });

  after(async function() {
    await browser.close();
  });

  afterEach(async function() {
    // Clear storage and reload the page between tests.
    const wait = page.waitForNavigation();
    await page.evaluate(function() {
      if (window.localStorage) localStorage.clear();
      location.reload(true);
    });
    await wait;
  });

  describe('initial state', function() {
    it('loads', async function() {
      expect(await page.title()).contain('TodoMVC');
    });
    it('focuses input', async function() {
      expect(
        await page.$eval(
          newInputSelector,
          input => input && input === document.activeElement
        )
      ).true;
    });
  });

  describe('no todos', function() {
    it('hides everything', async function() {
      const main = await page.$('.main');
      if (!main) expect(await getItems(page)).empty;
      await isVisible(page, 'footer', false);
    });
  });

  describe('adding items', function() {
    it('adds items', async function() {
      await addItem(page, 'one');
      expect((await getItems(page)).length).equal(1);
      await addItem(page, 'two');
      const text = await page.$$eval('ul.todo-list li', es =>
        es.map(e => e.textContent)
      );
      expect(text).eql(['one', 'two']);
    });

    it('clears text input field', async function() {
      await addItem(page, 'one');
      expect(await page.$eval(newInputSelector, e => e.textContent)).equal('');
    });

    it('trims text input', async function() {
      await addItem(page, '  one');
      expect(await getItems(page)).eql(['one']);
    });

    it('shows main and footer after items added', async function() {
      await addItem(page, 'one');
      await isVisible(page, 'main', true);
      await isVisible(page, 'footer', true);
    });
  });

  describe('mark all as completed', function () {
    async function clickToggleAll() {
      await page.$eval('input.toggle-all', t => (t as HTMLElement).click());
    }
    async function getToggleAllChecked() {
      return await page.$eval('input.toggle-all', t => (t as HTMLInputElement).checked);
    }

    beforeEach(async function() {
      await addItem(page, 'one');
      await addItem(page, 'two');
      await addItem(page, 'three');
    });

    it('marks all', async function () {
      await clickToggleAll();
      expect(await getItemsCompleted(page)).eql([true, true, true]);
    });

    it('should correctly update the complete all checked state', async function () {
      const toggles = await getItemsToggles(page);
      await page.evaluate(t => t.click(), toggles[0]);
      await page.evaluate(t => t.click(), toggles[1]);
      await page.evaluate(t => t.click(), toggles[2]);

      expect(await getToggleAllChecked()).true;
    });

    it('should allow me to clear the completion state of all items', async function () {
      await clickToggleAll();
      await clickToggleAll();
      expect(await getItemsCompleted(page)).eql([false, false, false]);
    });

    it('complete all checkbox should update state when items are completed / cleared', async function () {
      await clickToggleAll();
      expect(await getToggleAllChecked()).true;

      // Mark one not complete.
      const toggles = await getItemsToggles(page);
      expect(await getToggleAllChecked()).true;
      await page.evaluate(t => t.click(), toggles[0]);
      expect(await getToggleAllChecked()).false;

      // Mark as complete, so that once again all items are completed.
      await page.evaluate(t => t.click(), toggles[0]);
      expect(await getToggleAllChecked()).true;
    });
  });

  describe('items', function () {
    it('can be set complete', async function () {
      await addItem(page, 'one');
      await addItem(page, 'two');

      const toggles = await getItemsToggles(page);
      await page.evaluate(t => t.click(), toggles[0]);
      expect(await getItemsCompleted(page)).eql([true, false]);

      await page.evaluate(t => t.click(), toggles[1]);
      expect(await getItemsCompleted(page)).eql([true, true]);
    });

    it('can un-mark items', async function () {
      await addItem(page, 'one');
      await addItem(page, 'two');

      const toggles = await getItemsToggles(page);
      await page.evaluate(t => t.click(), toggles[0]);
      expect(await getItemsCompleted(page)).eql([true, false]);

      await page.evaluate(t => t.click(), toggles[0]);
      expect(await getItemsCompleted(page)).eql([false, false]);
    });

  });

});
