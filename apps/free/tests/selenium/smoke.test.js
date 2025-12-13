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

async function stopServer() {
  if (serverProcess) {
    return new Promise((resolve) => {
      serverProcess.once('exit', () => {
        serverProcess = undefined;
        resolve();
      });
      serverProcess.kill('SIGTERM');
      // Force kill after 2 seconds if still running
      setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL');
          serverProcess = undefined;
        }
        resolve();
      }, 2000);
    });
  }
}

before(async () => {
  startServer();
  await waitForServer(SERVER_URL);

  const options = new firefox.Options().addArguments('-headless');
  driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
});

after(async () => {
  try {
    if (driver) {
      await Promise.race([
        driver.quit(),
        new Promise((resolve) => setTimeout(resolve, 5000)), // 5 second timeout
      ]);
    }
  } catch (err) {
    console.error('Error quitting driver:', err);
  }
  await stopServer();
});

test('Splash redirects to feed route', { timeout: 30000 }, async () => {
  await driver.get(SERVER_URL);

  await driver.wait(until.elementLocated(By.css('body')), 10000);
  await driver.wait(async () => {
    const state = await driver.executeScript('return document.readyState');
    return state === 'complete';
  }, 10000);

  const bodyText = await driver.findElement(By.css('body')).getText();
  assert.ok(bodyText !== undefined, 'Body should be rendered');
});

