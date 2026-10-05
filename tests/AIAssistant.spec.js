const { test, expect } = require('@playwright/test');

const { HomePage } = require('../pages/HomePage');
const { AIAssistantPage } = require('../pages/AIAssistantPage');
const { ProductPage } = require('../pages/ProductPage');

test.setTimeout(60000);
test(
    'AI Assistant - Search, Filter, Add Product to Cart',
    async ({ page }) => {
        const homePage = new HomePage(page);
        const aiAssistant = new AIAssistantPage(page);
        const STORE_NAME = 'Gadgets Guru';

        console.log('Stage 1: Navigating to TechPay...');

        await homePage.navigate();

        console.log('Stage 2: Handling personal information...');

        await homePage.handlePersonalInfoModal('Ganesh', '8148478118');

        console.log(`Stage 3: Selecting ${STORE_NAME} store...`);

        await homePage.selectStoreLocation(STORE_NAME);

        console.log('Stage 4: Opening TechPay AI Assistant...');

        await aiAssistant.openAssistant();

        console.log('Stage 5: Searching gaming laptop using AI...');

        await aiAssistant.searchAndFilterProduct('Get me a gaming laptop');

        console.log('Stage 6: Opening AI recommended product...');

        const productPageTab = await aiAssistant.openRecommendedProduct(3);

        console.log('Stage 7: Initializing Product Page...');

        const productPage = new ProductPage(productPageTab);

      console.log(
    'Stage 8: Adding AI recommended product to cart...'
        );

        await productPage.addAIProductToCart();

        console.log(
            'Stage 9: Navigating to shopping cart...'
        );

        await productPage.navigateToAICart();

        console.log('Stage 10: Validating shopping cart...');

        await expect(productPage.cartIcon.first()).toBeVisible();

        console.log('AI Assistant purchase journey completed successfully.');
    }
)