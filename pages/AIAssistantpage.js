
const { BasePage } = require('./BasePage');

class AIAssistantPage extends BasePage {

    constructor(page) {
        super(page);

        this.openAIButton = page.getByRole('button', {name: 'Open TechPay AI'});
        this.aiIframe = page.locator('iframe[title="TechPay Recommendation AI"]');
    }

    getAIFrame() {return this.aiIframe.contentFrame();}

    async openAssistant() {

    console.log('Opening TechPay AI Assistant...');

    await this.openAIButton.waitFor({state: 'visible', timeout: 10000});
    await this.openAIButton.click();

    console.log('Waiting for AI iframe...');

    await this.aiIframe.waitFor({state: 'visible', timeout: 15000});
    await this.page.waitForTimeout(2500);

    console.log('AI Assistant iframe loaded.');

    console.log('AI iframe count:', await this.page.locator('iframe[title="TechPay Recommendation AI"]').count());
    console.log('Type instead count:',
    await this.page.locator('iframe[title="TechPay Recommendation AI"]')
    .contentFrame()
    .getByRole('button', { name: 'Type instead'}).count()
    );
}   

    async clickTypeInstead() {
    console.log('DEBUGGING AI ASSISTANT');

    const iframe = this.page.locator('iframe[title="TechPay Recommendation AI"]');

    await iframe.waitFor({state: 'visible', timeout: 15000});
    console.log('AI iframe count:', await iframe.count());

    const frame = iframe.contentFrame();

    const buttons = frame.getByRole('button');

    console.log('Number of buttons inside AI:',await buttons.count());

    for (let i = 0; i < await buttons.count(); i++) {

        const button = buttons.nth(i);

        console.log(`AI Button ${i}:`, await button.innerText().catch(() => 'NO TEXT'));
    }

    const bodyText = await frame.locator('body').innerText().catch(() => '');

    console.log('AI IFRAME TEXT:');
    console.log(bodyText);

    await this.page.screenshot({
    path: `test-results/debug-ai-state-${Date.now()}.png`,
    fullPage: true
});

    console.log('Screenshot saved as debug-ai-state.png');

    const typeInstead = frame.getByRole('button', {name: 'Type instead'});

    console.log('Type instead count:', await typeInstead.count());
}

    async enterQuery(query) {

        console.log(`AI Search Query: "${query}"`);

        const frame = this.getAIFrame();
        const messageTextbox = frame.getByRole('textbox', {name: 'Message'});

        await messageTextbox.waitFor({state: 'visible', timeout: 10000});
        await messageTextbox.fill(query);
        console.log('AI query entered.');
    }

    async sendQuery() {

        console.log('Sending AI search query...');

        const frame = this.getAIFrame();
        const sendButton = frame.getByRole('button', {name: 'Send'});

        await sendButton.waitFor({state: 'visible', timeout: 10000});

        await sendButton.click();
        console.log('AI query sent.');
        await this.page.waitForTimeout(1500);
    }


    async selectGaming() {

        console.log('Selecting Gaming category...');

        const frame = this.getAIFrame();

        const gamingButton = frame.getByRole('button', {name: 'Gaming'});

        await gamingButton.waitFor({state: 'visible', timeout: 15000});

        await gamingButton.click();

        console.log('Gaming category selected.');
    }


    async selectUnder60k() {

        console.log('Selecting budget: Under ₹60k...');

        const frame = this.getAIFrame();
        const under60kButton = frame.getByRole('button', {name: 'Under ₹60k'});

        await under60kButton.waitFor({state: 'visible', timeout: 15000});
        await under60kButton.click();

        console.log('Budget selected.');
    }


    async updateRecommendations() {

        console.log('Updating AI recommendations...');

        const frame = this.getAIFrame();
        const updateButton = frame.getByRole('button', {
            name: 'Update recommendations'
        });

        await updateButton.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await updateButton.click();
        await this.page.waitForTimeout(2000);
        console.log('AI recommendations updated.');
    }


    async searchAndFilterProduct(query) {

        await this.clickTypeInstead();
        await this.enterQuery(query);
        await this.sendQuery();
        await this.selectGaming();
        await this.selectUnder60k();
        await this.updateRecommendations();
    }


    async openRecommendedProduct(index = 3) {

        console.log(`Opening AI recommendation #${index + 1}...`);

        const frame = this.getAIFrame();

        const productLink = frame.getByRole('link', {name: 'Buy on TechPay'}).nth(index);

        await productLink.waitFor({state: 'visible', timeout: 15000});

        const popupPromise = this.page.waitForEvent('popup');

        await productLink.click();

        const productPage = await popupPromise;

        await productPage.waitForLoadState('domcontentloaded');

        console.log('Product page opened successfully.');

        return productPage;
    }

    // ==================================================
// INDIA AI ASSISTANT
// PRODUCT DETAIL PAGE
// ==================================================

async hasAIProductAvailable() {

    console.log(
        'Checking AI product-detail page...'
    );

    // Wait for SPA product page to render
    await this.page.waitForTimeout(1500);

    console.log(
        `Current product URL: ${this.page.url()}`
    );

    // --------------------------------------------------
    // VERIFY PRODUCT PAGE
    // --------------------------------------------------

    if (!this.page.url().includes('/products/')) {

        console.log(
            'Current page is not a product-detail page.'
        );

        return false;
    }

    console.log(
        'AI product-detail page confirmed.'
    );


    // --------------------------------------------------
    // EXACT ADD TO CART BUTTON
    // --------------------------------------------------

    const addToCartButton =
        this.page.getByRole(
            'button',
            {
                name: 'Add to cart',
                exact: true
            }
        ).first();


    // --------------------------------------------------
    // WAIT FOR BUTTON
    // --------------------------------------------------

    const visible =
        await addToCartButton
            .isVisible({
                timeout: 15000
            })
            .catch(() => false);

    if (!visible) {

        console.log(
            'Add to cart button is not visible.'
        );

        return false;
    }

    console.log(
        'Add to cart button found.'
    );

    return true;
}

}

module.exports = { AIAssistantPage };

