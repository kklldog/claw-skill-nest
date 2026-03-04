const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: /.*\.e2e\.spec\.js$/,
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:17891',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'PORT=17891 API_KEY=test-key DATA_DIR=./test-results/data node index.js',
    url: 'http://127.0.0.1:17891',
    timeout: 120000,
    reuseExistingServer: false
  }
});
