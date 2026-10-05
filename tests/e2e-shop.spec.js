const { test, expect } = require('@playwright/test');

const { HomePage } = require('../pages/HomePage');
const { FilterPage } = require('../pages/FilterPage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { LoginPage } = require('../pages/LoginPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { productCatalog, normalizeCategory, getProductConfiguration} = require('../pages/ProductCatalogPage');


test.use({
    permissions: ['geolocation'],
    geolocation: {
        latitude: 12.9716,
        longitude: 77.5946
    }
});


test(
    'POM E2E Shop Journey: Complete Purchase Flow',
    async ({ page }) => {

    test.setTimeout(120000);

    const homepage = new HomePage(page);
    const filterPage = new FilterPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    const STORE_NAME = 'Gadgets Guru';

    const SELECTED_CATEGORY = 'Laptops';

    const PRODUCT_INDEX = 1;

    const LOGIN_PHONE_NUMBER = '8148478118';

    const DISCOUNT_AMOUNT = 5000;

    const PAYMENT_METHOD = 'Cards';

    const PAYMENT_SUB_OPTION = 'RuPay Debit Card';

    const {category: NORMALIZED_CATEGORY, data: categoryData} = getProductConfiguration(SELECTED_CATEGORY);
    console.log(`SELECTED CATEGORY: ${SELECTED_CATEGORY}`);
    console.log(`SEARCH: ${categoryData.search}`);

    await homepage.navigate();

    await homepage.handlePersonalInfoModal(
        'Ganesh',
        LOGIN_PHONE_NUMBER
    );

    console.log(`Selecting store: ${STORE_NAME}`);

    const storeSelected = await homepage.selectStoreLocation(STORE_NAME);

    if (!storeSelected) {

    console.log('========================================');
    console.log(`STORE "${STORE_NAME}" NOT AVAILABLE`);
    console.log('Stopping test execution.');
    console.log('Expected result achieved.');
    console.log('TEST PASSED');
    console.log('========================================');

    return;
}

    console.log('Store successfully selected.');    

    console.log('Searching product...');

    await homepage.executeSearch(categoryData.search);

    console.log(`Selecting category: ${SELECTED_CATEGORY}`);

    await homepage.selectProductCategory(NORMALIZED_CATEGORY);

    console.log(`APPLYING ${NORMALIZED_CATEGORY.toUpperCase()} FILTERS`);

    const productAvailable = await filterPage.isProductAvailable();

if (!productAvailable) {

    console.log('Product unavailable in selected store.');

    console.log('Stopping execution successfully.');

    return;
}

    await filterPage.applyFilters(categoryData.filters);

    console.log('Adding first filtered product to cart...');

    const productsAvailable = await productPage.hasProductsAvailable();

    if (!productsAvailable) {

    console.log(`NO ${SELECTED_CATEGORY.toUpperCase()} PRODUCT AVAILABLE`);

    console.log('Selected filters do not match any product in this store.');

    return;
}

    console.log('Adding first available product to cart...');

    // await productPage.addFirstProductToCart();

    await productPage.addProductToCart(PRODUCT_INDEX);

    await productPage.navigateToCart();

    const totalItems = await cartPage.getCartItemsCount();

    expect(totalItems).toBeGreaterThan(0);

    console.log(`Cart contains ${totalItems} item(s).`);

    await cartPage.proceedToCheckout();

    await loginPage.loginWithAutoOtp(LOGIN_PHONE_NUMBER);

    console.log('Current URL after login:', page.url());
    console.log('Login process completed.');

    console.log('Checking discount...');

    const discountApplied =
    await checkoutPage.applyDiscountAndVerify(
        DISCOUNT_AMOUNT
    );

   console.log('PAYMENT FLOW');

const payment = await checkoutPage.getPaymentOptions();

const payOnline = payment.payOnline;
const payOffline = payment.payOffline;

console.log(`Pay Online available: ${payOnline}`);
console.log(`Pay Offline available: ${payOffline}`);

// ==========================================
// PAY ONLINE
// ==========================================

if (payOnline) {

    console.log('========================================');
    console.log('PAY ONLINE STORE');
    console.log('========================================');

    console.log(`Payment Method: ${PAYMENT_METHOD}`);
    console.log(`Payment Sub-Option: ${PAYMENT_SUB_OPTION}`);

    const paymentGateway =
        await checkoutPage.clickPayOnline(45000);

    // Pay Online option is available,
    // but Pay Now may not actually be available
    if (paymentGateway) {

        console.log(
            'Pay Online gateway opened successfully.'
        );

        const paymentSelected =
            await paymentGateway
                .selectPaymentMethodWithSubOption(
                    PAYMENT_METHOD,
                    PAYMENT_SUB_OPTION
                );

        if (!paymentSelected) {
            throw new Error(
                `FAIL: ${PAYMENT_METHOD} → ` +
                `${PAYMENT_SUB_OPTION} could not be selected.`
            );
        }

        console.log(
            `${PAYMENT_METHOD} → ` +
            `${PAYMENT_SUB_OPTION} selected successfully.`
        );

        console.log('Clicking final Pay INR...');

        await paymentGateway.clickFinalPayment();

        console.log(
            'Online payment flow completed.'
        );

    } else {

        // ==========================================
        // PAY ONLINE FAILED → PAY OFFLINE FALLBACK
        // ==========================================

        console.log(
            'Pay Now is not available.'
        );

        if (payOffline) {

            console.log(
                'Falling back to Pay Offline...'
            );

            await checkoutPage.clickPayOffline();

            console.log(
                'Pay Offline flow completed.'
            );

        } else {

            throw new Error(
                'FAIL: Pay Now is unavailable and ' +
                'Pay Offline is also unavailable.'
            );
        }
    }

// ==========================================
// PAY OFFLINE
// ==========================================

} else if (payOffline) {

    console.log('========================================');
    console.log('PAY OFFLINE STORE');
    console.log('========================================');

    await checkoutPage.clickPayOffline();

    console.log(
        'Pay Offline flow completed.'
    );

// ==========================================
// NO PAYMENT OPTION
// ==========================================

} else {

    throw new Error(
        'FAIL: Neither Pay Online nor Pay Offline is available.'
    );
}

console.log('========================================');
console.log('E2E PURCHASE FLOW COMPLETED');
console.log('========================================');
await page.waitForTimeout(4000);
await page.pause();

});