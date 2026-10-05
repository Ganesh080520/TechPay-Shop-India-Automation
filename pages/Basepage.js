class BasePage {
 
  constructor(page) {
    this.page = page;
    this.globalSpinner = page.locator('.mantine-Loader-root, div[class*="loading-indicator"]');
  }

  
  async navigateTo(path = '') {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

 
  async waitForPageReady() {
    if (await this.globalSpinner.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.globalSpinner.first().waitFor({ state: 'detached', timeout: 15000 });
    }
  }
}

module.exports = { BasePage };
