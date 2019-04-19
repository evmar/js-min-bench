import * as puppeteer from 'puppeteer';

async function main() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('http://localhost:9000');
    await browser.close();
}

main().catch((err) => {
    console.error('XXX', err);
    process.exitCode = 1;
});
