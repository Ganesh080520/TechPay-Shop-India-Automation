const {
    test,
    expect
} = require('@playwright/test');

const {
    HomePage
} = require('../pages/HomePage');

const {
    RecommendationAIPage
} = require('../pages/RecommendationAIPage');

const {
    ProductPage
} = require('../pages/ProductPage');

const {
    CartPage
} = require('../pages/CartPage');

const {
    LoginPage
} = require('../pages/LoginPage');

const {
    CheckoutPage
} = require('../pages/CheckoutPage');


// ======================================================
// TEST
// ======================================================

test(
    'India Recommendation AI - Complete E2E Purchase Flow',
    async ({ page }) => {

        test.setTimeout(120000);


        // ==================================================
        // TEST DATA
        // ==================================================

        const PRODUCT_TYPE = 'Laptop';

        const PERSONA = 'Office Work';

        const BUDGET = 'Under ₹60k';

        const MOBILE_NUMBER = '8148478118';
        
        const STORE_NAME = 'Gadgets Guru';

        // ==================================================
        // STAGE 1
        // NAVIGATE TO SHOP
        // ==================================================

        console.log('========================================');
        console.log('INDIA RECOMMENDATION AI E2E STARTED');
        console.log('========================================');

        const homePage =
            new HomePage(page);

        await homePage.navigate();


        // ==================================================
        // STAGE 2
        // INDIA STORE SELECTION
        // ==================================================

        console.log(
            'Stage 2: Handling India store selection...'
        );

        // Use your existing store-selection method here
        //
        // Example:
        console.log('Stage 2: Handling personal information...');

        await homePage.handlePersonalInfoModal('Ganesh', '8148478118');

        console.log(`Stage 3: Selecting ${STORE_NAME} store...`);

        await homePage.selectStoreLocation(STORE_NAME);

        // ==================================================
        // STAGE 3
        // OPEN RECOMMENDATION AI
        // ==================================================

        console.log(
            'Stage 3: Opening Recommendation AI...'
        );

        const aiPage =
            await homePage.openRecommendationAI();

        const recommendationAI =
            new RecommendationAIPage(aiPage);


        // ==================================================
        // STAGE 4
        // SELECT PRODUCT TYPE
        // ==================================================

        console.log(
            `Stage 4: Selecting product: ${PRODUCT_TYPE}`
        );

        await recommendationAI.selectProductType(
            PRODUCT_TYPE
        );


        // ==================================================
        // STAGE 5
        // SELECT PERSONA
        // ==================================================

        console.log(
            `Stage 5: Selecting persona: ${PERSONA}`
        );

        await recommendationAI.selectPersona(
            PERSONA
        );


        // ==================================================
        // STAGE 6
        // SELECT BUDGET
        // ==================================================

        console.log(
            `Stage 6: Selecting budget: ${BUDGET}`
        );

        await recommendationAI.selectBudget(
            BUDGET
        );


        // ==================================================
        // STAGE 7
        // UPDATE RECOMMENDATIONS
        // ==================================================

        console.log(
            'Stage 7: Updating recommendations...'
        );

        await recommendationAI.updateRecommendations();


        // ==================================================
        // STAGE 8
        // VERIFY RECOMMENDATION RESULTS
        // ==================================================

        console.log(
            'Stage 8: Verifying recommendation results...'
        );

        const buyButtons =
            aiPage.getByRole(
                'link',
                {
                    name: 'Buy on TechPay'
                }
            );

        await expect(
            buyButtons.first()
        ).toBeVisible({
            timeout: 15000
        });

        console.log(
            'Recommendation results displayed.'
        );


        // ==================================================
        // STAGE 9
        // OPEN RECOMMENDED PRODUCT
        // ==================================================

        console.log(
            'Stage 9: Opening recommended product...'
        );

        const shopPage =
            await recommendationAI.clickBuyOnTechPay(0);


        // ==================================================
        // STAGE 10
        // VERIFY PRODUCT PAGE
        // ==================================================

        console.log(
            'Stage 10: Verifying recommended product page...'
        );

        await expect(
            shopPage.getByRole(
                'button',
                {
                    name: /Add to cart/i
                }
            ).first()
        ).toBeVisible({
            timeout: 15000
        });

        console.log(
            'Recommended product page opened.'
        );


        // ==================================================
        // STAGE 11
        // ADD AI RECOMMENDED PRODUCT TO CART
        // ==================================================

        console.log(
            'Stage 11: Adding recommended product to cart...'
        );

        const product =
            new ProductPage(shopPage);

        const addedToCart =
            await product.addAIProductToCart();

        if (!addedToCart) {

            throw new Error(
                'AI recommended product could not be added to cart.'
            );
        }

        console.log(
            'Recommended product added to cart successfully.'
        );


        // ==================================================
        // STAGE 12
        // NAVIGATE TO SHOPPING CART
        // ==================================================

        console.log(
            'Stage 12: Navigating to shopping cart...'
        );

        const cartOpened =
            await product.navigateToAICart();

        if (!cartOpened) {

            throw new Error(
                'Could not navigate to shopping cart from AI product page.'
            );
        }

        console.log(
            'Shopping cart opened successfully.'
        );


        // ==================================================
        // STAGE 13
        // INITIALIZE CART PAGE
        // ==================================================

        console.log(
            'Stage 13: Initializing Cart Page...'
        );

        const cart =
            new CartPage(shopPage);

        console.log(
            'Cart Page initialized.'
        );


        // ==================================================
        // STAGE 14
        // PROCEED TO CHECKOUT
        // ==================================================

        console.log(
            'Stage 14: Proceeding to checkout...'
        );

        await cart.proceedToCheckout();

        console.log(
            'Checkout page opened successfully.'
        );


        // ==================================================
        // STAGE 15
        // LOGIN
        // ==================================================

        console.log(
            'Stage 15: Opening login...'
        );

        console.log(
            'DEBUG MOBILE_NUMBER:',
            MOBILE_NUMBER
        );

        console.log(
            'DEBUG MOBILE_NUMBER TYPE:',
            typeof MOBILE_NUMBER
        );

        const login =
            new LoginPage(shopPage);

        await login.loginWithAutoOtp(
            MOBILE_NUMBER
        );

        console.log(
            'Login completed successfully.'
        );


        // ==================================================
        // STAGE 16
        // CHECKOUT PAGE
        // ==================================================

        console.log(
            'Stage 16: Waiting for checkout page...'
        );

        const checkout =
            new CheckoutPage(shopPage);

        await checkout.waitForCheckoutPage();

        console.log(
            'Checkout page loaded successfully.'
        );


        // ==================================================
        // STAGE 17
        // COUPON
        // ==================================================

        /*
        console.log(
            'Stage 17: Applying coupon...'
        );

        const couponInput =
            shopPage.getByRole(
                'textbox',
                {
                    name: 'Enter coupon code'
                }
            );

        await couponInput.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await couponInput.fill(
            'TEST-123'
        );

        const applyButton =
            shopPage.getByRole(
                'button',
                {
                    name: 'Apply',
                    exact: true
                }
            );

        await applyButton.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await applyButton.click();

        await shopPage.waitForTimeout(1500);

        console.log(
            'Coupon applied.'
        );
        */


        // ==================================================
        // STAGE 18
        // PAYMENT OPTIONS
        // ==================================================

        console.log(
            'Stage 18: Checking payment options...'
        );

        const payment =
            await checkout.getPaymentOptions();

        expect(
            payment.payOffline
        ).toBeTruthy();

        console.log(
            'Pay Offline is available.'
        );


        // ==================================================
        // STAGE 19
        // PAY OFFLINE
        // ==================================================

        console.log(
            'Stage 19: Selecting Pay Offline...'
        );

        await checkout.clickPayOffline();


        // ==================================================
        // TEST COMPLETED
        // ==================================================

        console.log('========================================');

        console.log(
            'INDIA RECOMMENDATION AI E2E COMPLETED'
        );

        console.log('========================================');

    }
);