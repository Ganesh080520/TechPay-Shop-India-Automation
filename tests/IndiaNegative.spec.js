const {
    test,
    expect
} = require('@playwright/test');

const {
    HomePage
} = require('../pages/HomePage');

const {
    FilterPage
} = require('../pages/FilterPage');

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

const {
    AIAssistantPage
} = require('../pages/AIAssistantPage');

const {
    RecommendationAIPage
} = require('../pages/RecommendationAIPage');

const {
    IndiaNegativePage
} = require('../pages/IndiaNegativePage');


// ==================================================
// GEOLOCATION
// SAME AS NORMAL E2E
// ==================================================

test.use({

    permissions: [
        'geolocation'
    ],

    geolocation: {
        latitude: 12.9716,
        longitude: 77.5946
    }
});


// ==================================================
// INDIA NEGATIVE TEST DATA
// ==================================================
//
// CHANGE VALUES HERE ONLY
//

const NEGATIVE_TEST_DATA = {

    STORE_NAME:
        'Gadgets Guru',

    NAME:
        'Ganesh',

    VALID_PHONE:
        '8148478118',

    INVALID_PHONE:
        '1234567',

    INVALID_PRODUCT:
        'XYZ_INVALID_PRODUCT_999999',

    EMPTY_PRODUCT:
        '',

    WHITESPACE_SEARCH:
        '     ',

    INVALID_CATEGORY:
        'XYZ_INVALID_CATEGORY',

    INVALID_FILTER:
        'XYZ_INVALID_MANUFACTURER',

    INVALID_PRODUCT_INDEX:
        999,

    INVALID_OTP:
        '000000',

    INVALID_DISCOUNT_TEXT:
        'ABCDE',

    AI_EMPTY_MESSAGE:
        '',

    AI_WHITESPACE_MESSAGE:
        '     ',

    AI_INVALID_MESSAGE:
        'xvxvxv xyz999 invalid gaming laptop',

    INVALID_AI_PRODUCT_TYPE:
        'XYZ_INVALID_PRODUCT',

    INVALID_AI_PERSONA:
        'XYZ_INVALID_PERSONA',

    INVALID_AI_BUDGET:
        '₹999999999'
};


// ==================================================
// COMMON SHOP SETUP
// ==================================================
//
// SAME FLOW AS e2e-shop.spec.js:
//
// NAVIGATE
// → PERSONAL INFORMATION
// → STORE
//

async function prepareIndiaStore(page) {

    const homePage =
        new HomePage(page);

    console.log('========================================');
    console.log('PREPARING INDIA TECHPAY');
    console.log('========================================');


    // ==================================================
    // STAGE 1
    // NAVIGATE
    // ==================================================

    console.log(
        'Stage 1: Navigating to TechPay...'
    );

    await homePage.navigate();


    // ==================================================
    // STAGE 2
    // PERSONAL INFORMATION
    // ==================================================

    console.log(
        'Stage 2: Handling personal information...'
    );

    await homePage.handlePersonalInfoModal(
        NEGATIVE_TEST_DATA.NAME,
        NEGATIVE_TEST_DATA.VALID_PHONE
    );


    // ==================================================
    // STAGE 3
    // STORE
    // ==================================================

    console.log(
        `Stage 3: Selecting ${NEGATIVE_TEST_DATA.STORE_NAME} store...`
    );

    const storeSelected =
        await homePage.selectStoreLocation(
            NEGATIVE_TEST_DATA.STORE_NAME
        );

    expect(
        storeSelected,
        `Store "${NEGATIVE_TEST_DATA.STORE_NAME}" should be available`
    ).toBeTruthy();

    console.log(
        'Store selected successfully.'
    );

    return homePage;
}


// ==================================================
// COMMON CART → CHECKOUT LOGIN SETUP
// ==================================================
//
// SAME FLOW AS NORMAL E2E:
//
// SEARCH
// → CATEGORY
// → FILTER
// → PRODUCT
// → CART
// → PROCEED TO CHECKOUT
//

async function prepareLoginFromCheckout(
    page
) {

    const homePage =
        await prepareIndiaStore(page);

    const filterPage =
        new FilterPage(page);

    const productPage =
        new ProductPage(page);

    const cartPage =
        new CartPage(page);


    // ==================================================
    // SEARCH
    // ==================================================

    console.log(
        'Searching Laptop...'
    );

    await homePage.executeSearch(
        'Laptop'
    );


    // ==================================================
    // CATEGORY
    // ==================================================

    await homePage.selectProductCategory(
        'Laptops'
    );


    // ==================================================
    // CHECK PRODUCT
    // ==================================================

    const available =
        await filterPage.isProductAvailable();

    expect(
        available,
        'Laptop products should exist for login precondition'
    ).toBeTruthy();


    // ==================================================
    // FILTER
    // ==================================================

    await filterPage.applyFilters({
        Manufacturer: 'HP'
    });


    // ==================================================
    // ADD PRODUCT
    // ==================================================

    const productsAvailable =
        await productPage.hasProductsAvailable();

    expect(
        productsAvailable
    ).toBeTruthy();

    await productPage.addProductToCart(
        0
    );


    // ==================================================
    // CART
    // ==================================================

    await productPage.navigateToCart();

    const totalItems =
        await cartPage.getCartItemsCount();

    expect(
        totalItems
    ).toBeGreaterThan(0);


    // ==================================================
    // CHECKOUT
    // ==================================================

    await cartPage.proceedToCheckout();

    await page.waitForTimeout(
        1000
    );

    return {
        homePage,
        filterPage,
        productPage,
        cartPage
    };
}


// ==================================================
// COMMON FULL CHECKOUT SETUP
// ==================================================
//
// SAME AS NORMAL E2E:
// CART
// → CHECKOUT
// → LOGIN
// → CHECKOUT PAGE
//

async function prepareCheckout(
    page
) {

    await prepareLoginFromCheckout(
        page
    );

    const loginPage =
        new LoginPage(page);

    console.log(
        'Starting checkout login...'
    );

    await loginPage.loginWithAutoOtp(
        NEGATIVE_TEST_DATA.VALID_PHONE
    );

    console.log(
        'Login completed.'
    );

    const checkoutPage =
        new CheckoutPage(page);

    await checkoutPage.waitForCheckoutPage();

    return {
        loginPage,
        checkoutPage
    };
}


// ==================================================
// TEST 1
// INVALID PRODUCT SEARCH
// ==================================================

test(
    'India - Invalid Product Search Validation',
    async ({ page }) => {

        test.setTimeout(60000);

        await prepareIndiaStore(page);

        const negative =
            new IndiaNegativePage(page);

        const result =
            await negative.validateInvalidSearch(
                NEGATIVE_TEST_DATA.INVALID_PRODUCT
            );

        expect(
            result,
            'Invalid product must not return valid products'
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 2
// EMPTY SEARCH
// ==================================================

test(
    'India - Empty Product Search Validation',
    async ({ page }) => {

        test.setTimeout(60000);

        await prepareIndiaStore(page);

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateEmptySearch()
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 3
// WHITESPACE SEARCH
// ==================================================

test(
    'India - Whitespace Search Validation',
    async ({ page }) => {

        test.setTimeout(60000);

        await prepareIndiaStore(page);

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateWhitespaceSearch(
                NEGATIVE_TEST_DATA.WHITESPACE_SEARCH
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 4
// INVALID CATEGORY
// ==================================================

test(
    'India - Invalid Category Validation',
    async ({ page }) => {

        test.setTimeout(60000);

        await prepareIndiaStore(page);

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateInvalidCategory(
                NEGATIVE_TEST_DATA.INVALID_CATEGORY
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 5
// INVALID FILTER
// ==================================================

test(
    'India - Invalid Manufacturer Filter Validation',
    async ({ page }) => {

        test.setTimeout(60000);

        const homePage =
            await prepareIndiaStore(page);

        await homePage.executeSearch(
            'Laptop'
        );

        await homePage.selectProductCategory(
            'Laptops'
        );

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateInvalidFilter(
                'Manufacturer',
                NEGATIVE_TEST_DATA.INVALID_FILTER
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 6
// INVALID PRODUCT INDEX
// ==================================================

test(
    'India - Invalid Product Index Validation',
    async ({ page }) => {

        test.setTimeout(60000);

        const homePage =
            await prepareIndiaStore(page);

        await homePage.executeSearch(
            'Laptop'
        );

        await homePage.selectProductCategory(
            'Laptops'
        );

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateInvalidProductIndex(
                NEGATIVE_TEST_DATA.INVALID_PRODUCT_INDEX
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 7
// EMPTY CART CHECKOUT
// ==================================================

test(
    'India - Empty Cart Checkout Validation',
    async ({ page }) => {

        test.setTimeout(60000);

        await prepareIndiaStore(page);

        const productPage =
            new ProductPage(page);

        await productPage.navigateToCart();

        await page.waitForTimeout(
            1000
        );

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateEmptyCart()
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 8
// EMPTY PHONE NUMBER
// ==================================================
//
// IMPORTANT:
// USE ACTUAL NORMAL FLOW TO REACH LOGIN:
//
// PRODUCT
// → CART
// → PROCEED TO CHECKOUT
// → LOGIN
//

test(
    'India - Empty Phone Number Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        await prepareLoginFromCheckout(
            page
        );

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateEmptyPhone()
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 9
// INVALID PHONE NUMBER
// ==================================================

test(
    'India - Invalid Phone Number Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        await prepareLoginFromCheckout(
            page
        );

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateInvalidPhone(
                NEGATIVE_TEST_DATA.INVALID_PHONE
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 10
// EMPTY OTP
// ==================================================

test(
    'India - Empty OTP Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        await prepareLoginFromCheckout(
            page
        );

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateEmptyOtp(
                NEGATIVE_TEST_DATA.VALID_PHONE
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 11
// INVALID OTP
// ==================================================

test(
    'India - Invalid OTP Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        await prepareLoginFromCheckout(
            page
        );

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateInvalidOtp(
                NEGATIVE_TEST_DATA.VALID_PHONE,
                NEGATIVE_TEST_DATA.INVALID_OTP
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 12
// EMPTY DISCOUNT
// ==================================================

test(
    'India - Empty Discount Validation',
    async ({ page }) => {

        test.setTimeout(120000);

        await prepareCheckout(page);

        const negative =
            new IndiaNegativePage(page);

        const result =
            await negative.validateEmptyDiscount();

        test.skip(
            result === null,
            'Discount field unavailable for this store'
        );

        expect(result).toBeTruthy();
    }
);


// ==================================================
// TEST 13
// ZERO DISCOUNT
// ==================================================

test(
    'India - Zero Discount Validation',
    async ({ page }) => {

        test.setTimeout(120000);

        await prepareCheckout(page);

        const negative =
            new IndiaNegativePage(page);

        const result =
            await negative.validateZeroDiscount();

        test.skip(
            result === null,
            'Discount field unavailable'
        );

        expect(result).toBeTruthy();
    }
);


// ==================================================
// TEST 14
// NEGATIVE DISCOUNT
// ==================================================

test(
    'India - Negative Discount Validation',
    async ({ page }) => {

        test.setTimeout(120000);

        await prepareCheckout(page);

        const negative =
            new IndiaNegativePage(page);

        const result =
            await negative.validateNegativeDiscount();

        test.skip(
            result === null,
            'Discount field unavailable'
        );

        expect(
            result,
            'Negative discount must not reduce total'
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 15
// EXCESSIVE DISCOUNT
// ==================================================

test(
    'India - Discount Greater Than Order Total Validation',
    async ({ page }) => {

        test.setTimeout(120000);

        await prepareCheckout(page);

        const negative =
            new IndiaNegativePage(page);

        const result =
            await negative.validateExcessiveDiscount();

        test.skip(
            result === null,
            'Discount field unavailable'
        );

        expect(
            result,
            'Discount must not create negative order total'
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 16
// NON-NUMERIC DISCOUNT
// ==================================================

test(
    'India - Non Numeric Discount Validation',
    async ({ page }) => {

        test.setTimeout(120000);

        await prepareCheckout(page);

        const negative =
            new IndiaNegativePage(page);

        const result =
            await negative.validateNonNumericDiscount(
                NEGATIVE_TEST_DATA.INVALID_DISCOUNT_TEXT
            );

        test.skip(
            result === null,
            'Discount field unavailable'
        );

        expect(result).toBeTruthy();
    }
);


// ==================================================
// TEST 17
// INVALID PAYMENT METHOD
// ==================================================

test(
    'India - Unsupported Payment Method Validation',
    async ({ page }) => {

        test.setTimeout(120000);

        const {
            checkoutPage
        } = await prepareCheckout(page);

        const payment =
            await checkoutPage.getPaymentOptions();

        test.skip(
            !payment.payOnline,
            'Pay Online unavailable for this store'
        );

        const gateway =
            await checkoutPage.clickPayOnline(
                45000
            );

        test.skip(
            !gateway,
            'Payment gateway unavailable'
        );

        let rejected = false;

        try {

            await gateway.selectPaymentMethod(
                'INVALID_PAYMENT_METHOD'
            );

        } catch (error) {

            console.log(
                'Invalid payment method rejected.'
            );

            rejected = true;
        }

        expect(rejected).toBeTruthy();
    }
);


// ==================================================
// TEST 18
// INVALID PAYMENT SUB OPTION
// ==================================================

test(
    'India - Invalid Payment Sub Option Validation',
    async ({ page }) => {

        test.setTimeout(120000);

        const {
            checkoutPage
        } = await prepareCheckout(page);

        const payment =
            await checkoutPage.getPaymentOptions();

        test.skip(
            !payment.payOnline,
            'Pay Online unavailable'
        );

        const gateway =
            await checkoutPage.clickPayOnline(
                45000
            );

        test.skip(
            !gateway,
            'Payment gateway unavailable'
        );

        const methodSelected =
            await gateway.selectPaymentMethod(
                'Cards'
            );

        expect(
            methodSelected
        ).toBeTruthy();

        const invalidSubOption =
            await gateway.selectPaymentSubOption(
                'INVALID_CARD_OPTION'
            );

        expect(
            invalidSubOption,
            'Invalid payment sub-option should not exist'
        ).toBeFalsy();
    }
);


// ==================================================
// TEST 19
// AI ASSISTANT EMPTY MESSAGE
// ==================================================
//
// SAME FLOW AS AIAssistant.spec.js:
//
// NAVIGATE
// → PERSONAL INFO
// → STORE
// → OPEN TECHPAY AI
//

test(
    'India AI Assistant - Empty Message Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        const homePage =
            new HomePage(page);

        const aiAssistant =
            new AIAssistantPage(page);

        console.log(
            'Stage 1: Navigating to TechPay...'
        );

        await homePage.navigate();

        console.log(
            'Stage 2: Handling personal information...'
        );

        await homePage.handlePersonalInfoModal(
            NEGATIVE_TEST_DATA.NAME,
            NEGATIVE_TEST_DATA.VALID_PHONE
        );

        console.log(
            'Stage 3: Selecting store...'
        );

        await homePage.selectStoreLocation(
            NEGATIVE_TEST_DATA.STORE_NAME
        );

        console.log(
            'Stage 4: Opening TechPay AI Assistant...'
        );

        await aiAssistant.openAssistant();

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateAIEmptyMessage()
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 20
// AI ASSISTANT WHITESPACE MESSAGE
// ==================================================

test(
    'India AI Assistant - Whitespace Message Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        const homePage =
            await prepareIndiaStore(page);

        const aiAssistant =
            new AIAssistantPage(page);

        await aiAssistant.openAssistant();

        const negative =
            new IndiaNegativePage(page);

        expect(
            await negative.validateAIWhitespaceMessage(
                NEGATIVE_TEST_DATA.AI_WHITESPACE_MESSAGE
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 21
// RECOMMENDATION AI
// INVALID PRODUCT TYPE
// ==================================================

test(
    'India Recommendation AI - Invalid Product Type Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        const homePage =
            await prepareIndiaStore(page);

        console.log(
            'Opening Recommendation AI...'
        );

        const aiPage =
            await homePage.openRecommendationAI();

        const negative =
            new IndiaNegativePage(aiPage);

        const result =
            await negative.validateMissingAIOption(
                NEGATIVE_TEST_DATA.INVALID_AI_PRODUCT_TYPE
            );

        expect(
            result,
            'Invalid Recommendation AI product type must not exist'
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 22
// RECOMMENDATION AI
// INVALID PERSONA
// ==================================================

test(
    'India Recommendation AI - Invalid Persona Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        const homePage =
            await prepareIndiaStore(page);

        const aiPage =
            await homePage.openRecommendationAI();

        const recommendationAI =
            new RecommendationAIPage(aiPage);

        await recommendationAI.selectProductType(
            'Laptop'
        );

        const negative =
            new IndiaNegativePage(aiPage);

        expect(
            await negative.validateMissingAIOption(
                NEGATIVE_TEST_DATA.INVALID_AI_PERSONA
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 23
// RECOMMENDATION AI
// INVALID BUDGET
// ==================================================

test(
    'India Recommendation AI - Invalid Budget Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        const homePage =
            await prepareIndiaStore(page);

        const aiPage =
            await homePage.openRecommendationAI();

        const recommendationAI =
            new RecommendationAIPage(aiPage);

        await recommendationAI.selectProductType(
            'Laptop'
        );

        await recommendationAI.selectPersona(
            'Office Work'
        );

        const negative =
            new IndiaNegativePage(aiPage);

        expect(
            await negative.validateMissingAIOption(
                NEGATIVE_TEST_DATA.INVALID_AI_BUDGET
            )
        ).toBeTruthy();
    }
);


// ==================================================
// TEST 24
// RECOMMENDATION AI
// UPDATE WITHOUT SELECTION
// ==================================================

test(
    'India Recommendation AI - Update Without Selection Validation',
    async ({ page }) => {

        test.setTimeout(90000);

        const homePage =
            await prepareIndiaStore(page);

        const aiPage =
            await homePage.openRecommendationAI();

        const negative =
            new IndiaNegativePage(aiPage);

        expect(
            await negative
                .validateRecommendationWithoutSelections()
        ).toBeTruthy();
    }
    
); 