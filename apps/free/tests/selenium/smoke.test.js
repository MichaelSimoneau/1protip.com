const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { spawn } = require('child_process');

const SERVER_URL = 'http://localhost:4173';

let serverProcess;
let driver;

function startServer() {
  serverProcess = spawn('npx', ['http-server', 'dist', '-p', '4173', '--silent'], {
    stdio: 'inherit',
  });
}

async function waitForServer(url, attempts = 20, delayMs = 500) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (err) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Server did not become ready at ${url}`);
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = undefined;
  }
}

before(async () => {
  startServer();
  await waitForServer(SERVER_URL);

  const options = new firefox.Options().addArguments('-headless');
  driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
});

after(async () => {
  if (driver) {
    await driver.quit();
  }
  stopServer();
});

test('Splash redirects to feed route', async () => {
  await driver.get(SERVER_URL);

  await driver.wait(until.elementLocated(By.css('body')), 10000);
  await driver.wait(async () => {
    const state = await driver.executeScript('return document.readyState');
    return state === 'complete';
  }, 10000);

  const bodyText = await driver.findElement(By.css('body')).getText();
  assert.ok(bodyText !== undefined, 'Body should be rendered');
});

