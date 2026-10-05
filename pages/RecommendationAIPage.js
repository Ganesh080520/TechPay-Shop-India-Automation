const { BasePage } = require('./BasePage');

class RecommendationAIPage extends BasePage {

    constructor(page) {
        super(page);

        // ==========================================
        // PRODUCT TYPE
        // ==========================================

        this.productTypeButtons =
            page.getByRole('button');


        // ==========================================
        // PERSONA
        // ==========================================

        this.personaButtons =
            page.getByRole('button');


        // ==========================================
        // BUDGET
        // ==========================================

        this.budgetButtons =
            page.getByRole('button');


        // ==========================================
        // UPDATE RECOMMENDATIONS
        // ==========================================

        this.updateRecommendationsButton =
            page.getByRole(
                'button',
                {
                    name: 'Update recommendations'
                }
            );


        // ==========================================
        // BUY ON TECHPAY
        // ==========================================

        this.buyOnTechPayLinks =
            page.getByRole(
                'link',
                {
                    name: 'Buy on TechPay'
                }
            );
    }


    // ==========================================
    // SELECT PRODUCT TYPE
    // ==========================================

    async selectProductType(productType) {

        console.log(
            `Selecting product type: ${productType}`
        );

        const option =
            this.productTypeButtons
                .filter({
                    hasText: productType
                })
                .first();

        await option.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await option.click();

        console.log(
            `Product type selected: ${productType}`
        );
    }


    // ==========================================
    // SELECT PERSONA
    // ==========================================

    async selectPersona(persona) {

        console.log(
            `Selecting persona: ${persona}`
        );

        const option =
            this.personaButtons
                .filter({
                    hasText: persona
                })
                .first();

        await option.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await option.click();

        console.log(
            `Persona selected: ${persona}`
        );
    }


    // ==========================================
    // SELECT BUDGET
    // ==========================================

    async selectBudget(budget) {

        console.log(
            `Selecting budget: ${budget}`
        );

        const option =
            this.budgetButtons
                .filter({
                    hasText: budget
                })
                .first();

        await option.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await option.click();

        console.log(
            `Budget selected: ${budget}`
        );
    }


    // ==========================================
    // UPDATE RECOMMENDATIONS
    // ==========================================

    async updateRecommendations() {

        console.log(
            'Updating recommendations...'
        );

        await this.updateRecommendationsButton
            .waitFor({
                state: 'visible',
                timeout: 10000
            });

        await this.updateRecommendationsButton.click();

        await this.page.waitForTimeout(2000);

        console.log(
            'Recommendations updated successfully.'
        );
    }


    // ==========================================
    // BUY ON TECHPAY
    // ==========================================

    async clickBuyOnTechPay(index = 0) {

        console.log(
            `Opening recommended product ${index + 1}...`
        );

        const buyLink =
            this.buyOnTechPayLinks.nth(index);

        await buyLink.waitFor({
            state: 'visible',
            timeout: 15000
        });


        // ==========================================
        // WAIT FOR NEW PRODUCT PAGE
        // ==========================================

        const productPagePromise =
            this.page.waitForEvent('popup');


        await buyLink.click();


        const productPage =
            await productPagePromise;


        // ==========================================
        // WAIT FOR PRODUCT PAGE TO LOAD
        // ==========================================

        await productPage.waitForLoadState(
            'domcontentloaded'
        );


        console.log(
            'Recommended product page opened.'
        );


        return productPage;
    }
}


module.exports = {
    RecommendationAIPage
};