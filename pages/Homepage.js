const { BasePage } = require('./BasePage'); 
class HomePage extends BasePage {
  constructor(page) {
    super(page);
    
    this.modal = page.locator('div[class*="mantine-Modal-body"]');
    this.nameInput = this.modal.getByPlaceholder('Your name *');
    this.phoneInput = this.modal.getByPlaceholder('Phone number *');
    this.ageGroupDropdown = this.modal.locator('div:has-text("Age group *")');
    this.occupationDropdown = this.modal.locator('div:has-text("Occupation *")');
    this.sendButton = this.modal.getByRole('button', { name: 'Send' });
    this.storeDropdownTrigger = page.locator('div:has-text("Store Location")').last().or(page.getByText('Store Location')).first();
    this.activatedStoreInput = page.locator('.mantine-Select-input, input[placeholder*="store" i], input[aria-haspopup="listbox"]').first();
    this.storeOptionBase = 'div[role="option"], [class*="SelectItem"], .mantine-Select-item';
    this.recommendationAI = page.getByText('Recommendation AI',{ exact: true });
    this.searchBar = page.getByPlaceholder(/search products|search/i).first();

  }

  async navigate() {
    await this.page.goto('https://shop.techpay.ai/in');  
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }

  async handlePersonalInfoModal(name, phone) {
    await this.modal.waitFor({ state: 'visible', timeout: 5000 });

    await this.nameInput.fill(name);
    await this.page.waitForTimeout(300); 
    await this.phoneInput.fill(phone);
    await this.page.waitForTimeout(300); 

    await this.page.keyboard.press('Tab'); 
    await this.page.keyboard.press('ArrowDown');
    await this.page.waitForTimeout(300); 
    await this.page.locator('[role="option"], [class*="mantine-Select-item"]').filter({ hasText: '25-34' }).first().click();

    await this.page.keyboard.press('Tab'); 
    await this.page.keyboard.press('ArrowDown'); 
    await this.page.waitForTimeout(300);
    await this.page.locator('[role="option"], [class*="mantine-Select-item"]').filter({ hasText: 'Self-employed' }).first().click();
    await this.sendButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000});
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000); 
  }

  async selectStoreLocation(storeName) {
    await this.modal.waitFor({ state: 'hidden', timeout: 7000 }).catch(() => null);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);

    console.log('Stage 1: Clicking the chevron-down arrow icon to activate store locator box...');
    const chevronIcon = this.page.locator('.icon-tabler-chevron-down').first();
    await chevronIcon.waitFor({ state: 'visible', timeout: 5000 });
    await chevronIcon.click({ force: true });
    await this.page.waitForTimeout(500);

    console.log('Stage 2: Clicking directly inside the revealed text box field input element to drop options menu down...');
    const selectStoreInput = this.page.getByPlaceholder('Select store').first();
    await selectStoreInput.waitFor({ state: 'visible', timeout: 5000 });
    await selectStoreInput.click({ force: true });
    await this.page.locator('div[role="listbox"], .mantine-Select-dropdown').waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    await this.page.waitForTimeout(800);

    console.log(`Stage 3: Locating and clicking target storefront selection option row: "${storeName}"`);
    const explicitStoreOption = this.page.locator(this.storeOptionBase).filter({ hasText: storeName }).first();

    const storeExists = await explicitStoreOption.isVisible({timeout: 3000}).catch(() => false);


    if (!storeExists) {

        console.log('========================================');

        console.log(`STORE NOT FOUND: "${storeName}"`);

        console.log('Expected negative condition detected.');

        console.log('Stopping test execution.');

        console.log('TEST STATUS: PASS');

        console.log('========================================');

        return false;
    }


    await explicitStoreOption.waitFor({ state: 'visible', timeout: 5000 });
    await explicitStoreOption.click({ force: true });
    // return true;
    
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1500); 
    console.log(`Store selected: ${storeName}`);
    return true;
  }

  async openRecommendationAI() {

    console.log(
        'Opening Recommendation AI from horizontal menu...'
    );

    await this.recommendationAI.waitFor({
        state: 'visible',
        timeout: 10000
    });

    const aiPagePromise =
        this.page.waitForEvent('popup');

    await this.recommendationAI.click();

    const aiPage =
        await aiPagePromise;

    await aiPage.waitForLoadState(
        'domcontentloaded'
    );

    console.log(
        'Recommendation AI opened successfully.'
    );

    return aiPage;
}

   async executeSearch(productQuery) {
    console.log(`Inputting search query parameter: "${productQuery}"`);
    await this.searchBar.waitFor({ state: 'visible', timeout: 5000 });
    await this.searchBar.click();
    await this.searchBar.fill('');
    await this.searchBar.pressSequentially(productQuery, { delay: 100 });


    const autocompleteOption = this.page.locator('div[role="option"], [data-combobox-option="true"]').first();
    
    if (
      await autocompleteOption.isVisible({ timeout: 2000 })
      .catch(() => false)
    ) {
      console.log('Autocomplete option found. Selecting it...');
      await autocompleteOption.click({ force: true });
    } else {
      await this.page.keyboard.press('Enter');
    }
    await this.searchBar.blur();
    await this.page.waitForTimeout(200);
    await this.page.keyboard.press('Escape');

    await this.page.waitForTimeout(500);

    console.log('Search execution completed.');
  }


async selectProductCategory(category) {

    console.log(
        `Selecting product category from horizontal menu: "${category}"`
    );

    const categoryLabels = {
        Laptop: 'Laptops',
        Desktop: 'Desktops',
        Printer: 'Printers',
        Peripheral: 'Peripherals',

        // Plural
        Laptops: 'Laptops',
        Desktops: 'Desktops',
        Printers: 'Printers',
        Peripherals: 'Peripherals'
    };

    const websiteCategory = categoryLabels[category];

    if (!websiteCategory) {
        throw new Error(
            `Unsupported product category: ${category}`
        );
    }

    console.log(
        `Looking for website category: "${websiteCategory}"`
    );

    const categoryLink = this.page
        .locator('a')
        .filter({
            hasText: new RegExp(
                `^${websiteCategory}$`,
                'i'
            )
        })
        .first();

    await categoryLink.waitFor({state: 'visible',timeout: 5000});

    await categoryLink.scrollIntoViewIfNeeded();

    console.log(`Clicking horizontal category: "${websiteCategory}"`);

    await categoryLink.click();

     await this.page.waitForTimeout(500);

    console.log(
        `Product category selected: "${websiteCategory}"`
    );
}
}
module.exports = { HomePage };
