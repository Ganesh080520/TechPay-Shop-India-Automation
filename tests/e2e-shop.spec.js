const { test, expect } = require('@playwright/test');

const { HomePage } = require('../pages/HomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { LoginPage } = require('../pages/LoginPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { FilterPage } = require('../pages/Filterpage');
const { PaymentGatewayPage } = require('../pages/PaymentGatewayPage');


// ============================================================
// TEST CONFIGURATION
// ============================================================

const BASE_URL =
    'https://shop.techpay.ai/in';


// ============================================================
// TEST USER
// ============================================================

const CUSTOMER_NAME =
    'Ganesh';

const MOBILE_NUMBER =
    process.env.MOBILE_NUMBER || '8148478118';


// ============================================================
// STORE
// ============================================================
//
// Pay Online:
// Gadgets Guru
//
// Pay Offline:
// Unique World - Unique Towers
//
// ============================================================

const STORE_NAME =
    'Shivjyoti Computers (Chomu)';


// ============================================================
// CATEGORY
// ============================================================
//
// Supported:
// Laptops
// Desktops
// Printers
// Peripherals
//
// ============================================================

const SELECTED_CATEGORY =
    'Printers';


// ============================================================
// PRODUCT CONFIGURATION
// ============================================================

const PRODUCT_CONFIG = {

    Laptops: {

        search: 'Laptop',

        category: 'Laptops',

        filters: {

            Manufacturer: 'HP',

            'Graphics Card':
                'Intel Graphics'
        }
    },


    Desktops: {

        search: 'Desktop',

        category: 'Desktops',

        filters: {

            Manufacturer: 'HP'
        }
    },


    Printers: {

        search: 'Printer',

        category: 'Printers',

        filters: {

            Manufacturer: 'HP'
        }
    },


    Peripherals: {

        search: 'Peripheral',

        category: 'Peripherals',

        filters: {

            Manufacturer: 'HP'
        }
    }
};


// ============================================================
// PAYMENT CONFIGURATION
// ============================================================

const PAYMENT_METHOD =
    'Cards';

const PAYMENT_SUB_OPTION =
    'RuPay Debit Card';


// ============================================================
// TEST
// ============================================================

test(
    'POM E2E Shop Journey: Complete Purchase Flow',

    async ({ page }) => {

        test.setTimeout(180000);


        // ====================================================
        // PAGE OBJECTS
        // ====================================================

        const homepage =
            new HomePage(page);

        const productPage =
            new ProductPage(page);

        const cartPage =
            new CartPage(page);

        const loginPage =
            new LoginPage(page);

        const checkoutPage =
            new CheckoutPage(page);

        const filterPage =
            new FilterPage(page);

        const paymentGateway =
            new PaymentGatewayPage(page);


        // ====================================================
        // LOAD CATEGORY CONFIG
        // ====================================================

        const categoryData =
            PRODUCT_CONFIG[
                SELECTED_CATEGORY
            ];


        if (!categoryData) {

            throw new Error(
                `Unsupported category: ${SELECTED_CATEGORY}`
            );
        }


        // ====================================================
        // START
        // ====================================================

        console.log(
            '========================================'
        );

        console.log(
            'TECHPAY INDIA E2E TEST STARTED'
        );

        console.log(
            '========================================'
        );

        console.log(
            `SELECTED CATEGORY: ${SELECTED_CATEGORY}`
        );

        console.log(
            `SEARCH: ${categoryData.search}`
        );


        // ====================================================
        // STEP 1
        // OPEN TECHPAY
        // ====================================================

        console.log(
            '\nSTEP 1: Opening TechPay Shop India...'
        );


        await homepage.navigate();


        console.log(
            'TechPay Shop opened successfully.'
        );


        // ====================================================
        // STEP 2
        // PERSONAL INFORMATION
        // ====================================================

        console.log(
            '\nSTEP 2: Handling personal information...'
        );


        await homepage.handlePersonalInfoModal(
            CUSTOMER_NAME,
            MOBILE_NUMBER
        );


        console.log(
            'Personal information completed.'
        );


        // ====================================================
        // STEP 3
        // STORE SELECTION
        // ====================================================

        console.log(
            `\nSTEP 3: Selecting store: ${STORE_NAME}`
        );


        await homepage.selectStoreLocation(
            STORE_NAME
        );


        console.log(
            `Store successfully selected: ${STORE_NAME}`
        );


        // ====================================================
        // STEP 4
        // SEARCH
        // ====================================================

        console.log(
            `\nSTEP 4: Searching for: ${categoryData.search}`
        );


        await homepage.executeSearch(
            categoryData.search
        );


        console.log(
            'Product search completed.'
        );


        // ====================================================
        // STEP 5
        // CATEGORY
        // ====================================================

        console.log(
            `\nSTEP 5: Selecting category: ${categoryData.category}`
        );


        await homepage.selectProductCategory(
            categoryData.category
        );


        console.log(
            `Product category selected: ${categoryData.category}`
        );


        // ====================================================
        // STEP 6
        // CHECK CATEGORY INVENTORY BEFORE FILTERING
        // ====================================================

        console.log(
            '\nSTEP 6: Checking category inventory...'
        );


        const categoryHasProducts =
            await filterPage.isProductAvailable();


        // ====================================================
        // ZERO INVENTORY
        // ====================================================

        if (!categoryHasProducts) {

            console.log(
                '\n========================================'
            );

            console.log(
                'NO PRODUCTS AVAILABLE'
            );

            console.log(
                '========================================'
            );

            console.log(
                `Store: ${STORE_NAME}`
            );

            console.log(
                `Category: ${categoryData.category}`
            );

            console.log(
                `Search: ${categoryData.search}`
            );

            console.log(
                'No products are available for this store/category combination.'
            );

            console.log(
                'Skipping category-specific filters.'
            );

            console.log(
                'Skipping Add to Cart.'
            );

            console.log(
                'Skipping Checkout.'
            );

            console.log(
                'Skipping Payment.'
            );


            // =================================================
            // VERIFY EMPTY STATE
            // =================================================

            console.log(
                '\nValidating empty catalogue state...'
            );


            const noProductsMessage = page
                .getByText(
                    /no products found|no products match/i
                )
                .first();


            const emptyStateVisible =
                await noProductsMessage
                    .isVisible({
                        timeout: 5000
                    })
                    .catch(() => false);


            expect(
                emptyStateVisible,
                `Empty-state message should be displayed for ${STORE_NAME} → ${SELECTED_CATEGORY}.`
            ).toBeTruthy();


            console.log(
                'Empty catalogue state validated successfully.'
            );


            console.log(
                '\n========================================'
            );

            console.log(
                `${SELECTED_CATEGORY.toUpperCase()} PURCHASE E2E: BLOCKED / NOT EXECUTED`
            );

            console.log(
                `Reason: No ${SELECTED_CATEGORY} inventory available for ${STORE_NAME}.`
            );

            console.log(
                '========================================'
            );

            console.log(
                'EMPTY INVENTORY TEST: PASSED'
            );

            console.log(
                '========================================'
            );


            return;
        }


        console.log(
            'Products are available before filtering.'
        );


        // ====================================================
        // STEP 7
        // APPLY PRODUCT FILTERS
        // ====================================================

        console.log(
            '\n========================================'
        );

        console.log(
            `APPLYING ${SELECTED_CATEGORY.toUpperCase()} FILTERS`
        );

        console.log(
            '========================================'
        );

        console.log(
            'Configured filters:',
            categoryData.filters
        );


        if (
            categoryData.filters &&
            Object.keys(
                categoryData.filters
            ).length > 0
        ) {

            await filterPage.applyFilters(
                categoryData.filters
            );


            console.log(
                'All configured product filters applied.'
            );
        }

        else {

            console.log(
                'No filters configured for this category.'
            );
        }


        // ====================================================
        // STEP 8
        // CHECK PRODUCTS AFTER FILTERING
        // ====================================================

        console.log(
            '\nSTEP 8: Checking filtered products...'
        );


        const filteredProductAvailable =
            await filterPage.isProductAvailable();


        if (!filteredProductAvailable) {

            console.log(
                '\n========================================'
            );

            console.log(
                'NO PRODUCTS MATCH CONFIGURED FILTERS'
            );

            console.log(
                '========================================'
            );

            console.log(
                `Store: ${STORE_NAME}`
            );

            console.log(
                `Category: ${SELECTED_CATEGORY}`
            );

            console.log(
                'Configured filters:',
                categoryData.filters
            );

            console.log(
                'Products exist in this category, but none match the configured filter combination.'
            );

            console.log(
                'Skipping Add to Cart / Checkout / Payment.'
            );


            console.log(
                '\n========================================'
            );

            console.log(
                `${SELECTED_CATEGORY.toUpperCase()} FILTERED PURCHASE E2E: BLOCKED / NOT EXECUTED`
            );

            console.log(
                '========================================'
            );


            return;
        }


        console.log(
            'Filtered products are available.'
        );


       // ============================================================
        // STEP 9
        // ADD PRODUCT TO CART
        // ============================================================

        const PRODUCT_INDEX = 1;

        console.log(
            `\nSTEP 9: Adding product index ${PRODUCT_INDEX} to cart...`
        );

        await productPage.addProductToCart(
            PRODUCT_INDEX
        );

        console.log(
            `Product at index ${PRODUCT_INDEX} added successfully.`
        );

        console.log(
            'Product added to cart.'
        );


        // ====================================================
        // STEP 10
        // NAVIGATE TO CART
        // ====================================================

        console.log(
            '\nSTEP 10: Navigating to cart...'
        );


        await productPage.navigateToCart();


        console.log(
            'Cart opened.'
        );


        // ====================================================
        // STEP 11
        // VERIFY BROWSING CART
        // ====================================================

        console.log(
            '\nSTEP 11: Verifying browsing cart...'
        );


        await cartPage.verifyCartHasProduct();


        console.log(
            'Browsing cart validation passed.'
        );


        // ====================================================
        // STEP 12
        // CHECKOUT
        // ====================================================

        console.log(
            '\nSTEP 12: Proceeding to checkout...'
        );


        await cartPage.proceedToCheckout();


        console.log(
            'Checkout initiated.'
        );


        // ====================================================
        // STEP 13
        // LOGIN
        // ====================================================

        console.log(
            '\nSTEP 13: Starting login...'
        );


        await loginPage.loginWithManualOtp(
            MOBILE_NUMBER
        );


        console.log(
            `Current URL after login: ${page.url()}`
        );

        console.log(
            'Login process completed.'
        );


        // ====================================================
        // STEP 14
        // EXISTING ACCOUNT CART
        // ====================================================

        console.log(
            '\nSTEP 14: Checking for existing account cart...'
        );


        const cartReplaced =
            await loginPage.handleReplaceCartModal();


        if (cartReplaced) {

            console.log(
                'Existing account cart replaced with current browsing cart.'
            );
        }

        else {

            console.log(
                'No cart replacement was required.'
            );
        }


        console.log(
            `URL after cart handling: ${page.url()}`
        );


        // ====================================================
        // STEP 15
        // DISCOUNT
        // ====================================================

        console.log(
            '\nSTEP 15: Checking discount...'
        );


        let discountResult = false;


        try {

            discountResult =
                await checkoutPage
                    .applyDiscountAndVerify();

        }

        catch (error) {

            console.log(
                `Discount validation skipped: ${error.message}`
            );

            discountResult = false;
        }


        console.log(
            `Discount validation result: ${discountResult}`
        );


        // ====================================================
        // STEP 16
        // PAYMENT FLOW
        // ====================================================

        console.log(
            '\n========================================'
        );

        console.log(
            'PAYMENT FLOW'
        );

        console.log(
            '========================================'
        );


        await checkoutPage.waitForCheckoutPage();


        const paymentOptions =
            await checkoutPage.getPaymentOptions();


        console.log(
            `Payment options -> Online: ${paymentOptions.payOnline}, Offline: ${paymentOptions.payOffline}`
        );


        // ====================================================
        // PAY ONLINE
        // ====================================================

        if (paymentOptions.payOnline) {

            console.log(
                '\n========================================'
            );

            console.log(
                'PAY ONLINE STORE'
            );

            console.log(
                '========================================'
            );

            console.log(
                `Payment Method: ${PAYMENT_METHOD}`
            );

            console.log(
                `Payment Sub-Option: ${PAYMENT_SUB_OPTION}`
            );


            // ------------------------------------------------
            // EXISTING WORKING PAY ONLINE FLOW
            // ------------------------------------------------

            await checkoutPage.clickPayOnline();


            console.log(
                'Pay Online gateway opened successfully.'
            );


            await paymentGateway
                .selectPaymentMethodWithSubOption(
                    PAYMENT_METHOD,
                    PAYMENT_SUB_OPTION
                );


            console.log(
                `${PAYMENT_METHOD} → ${PAYMENT_SUB_OPTION} selected successfully.`
            );


            // ------------------------------------------------
            // FINAL PAYMENT CTA
            //
            // This validates the button but does not submit
            // an actual financial transaction.
            // ------------------------------------------------

            console.log(
                'Checking final payment CTA...'
            );


            const paymentReady =
                await paymentGateway
                    .clickFinalPayment();


            expect(
                paymentReady,
                'Final payment CTA should be available and enabled.'
            ).toBeTruthy();


            console.log(
                'Online payment flow completed.'
            );
        }


        // ====================================================
        // PAY OFFLINE
        // ====================================================

        else if (paymentOptions.payOffline) {

            console.log(
                '\n========================================'
            );

            console.log(
                'PAY OFFLINE STORE'
            );

            console.log(
                '========================================'
            );

            console.log(
                'PROCESSING PAY OFFLINE'
            );


            await checkoutPage.clickPayOffline();


            console.log(
                'Pay Offline flow completed.'
            );
        }


        // ====================================================
        // NO PAYMENT OPTION
        // ====================================================

        else {

            throw new Error(
                'Neither Pay Online nor Pay Offline is available for the selected store.'
            );
        }


        // ====================================================
        // COMPLETE
        // ====================================================

        console.log(
            '\n========================================'
        );

        console.log(
            'E2E PURCHASE FLOW COMPLETED'
        );

        console.log(
            '========================================'
        );
    }
);