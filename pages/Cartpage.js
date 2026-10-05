const { BasePage } = require('./BasePage');
const { expect } = require('@playwright/test');

class CartPage extends BasePage {

    constructor(page) {

        super(page);

        // Avoid generic .mantine-Paper-root because many unrelated
        // Mantine components can match it.
        this.checkoutButton = page
            .getByRole('button', {
                name: /proceed to checkout|checkout|buy now/i
            })
            .first();

        this.emptyCartMessage = page
            .getByText(
                /your cart is empty|empty basket/i
            )
            .first();
    }


    // ============================================================
    // VERIFY CART IS NOT EMPTY
    // ============================================================

    async verifyCartHasProduct() {

        console.log(
            'Checking browsing cart...'
        );

        await this.waitForPageReady();


        const emptyCart =
            await this.emptyCartMessage
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);


        if (emptyCart) {

            throw new Error(
                'FAIL: Browsing cart is empty after adding product.'
            );
        }


        const checkoutVisible =
            await this.checkoutButton
                .isVisible({
                    timeout: 5000
                })
                .catch(() => false);


        expect(
            checkoutVisible,
            'Checkout button should be available when browsing cart contains a product.'
        ).toBeTruthy();


        console.log(
            'Browsing cart contains product(s).'
        );

        console.log(
            'Checkout action is available.'
        );


        return true;
    }


    // ============================================================
    // ENSURE CART HAS ITEMS
    // ============================================================

    async ensureCartHasItems(
        homepage,
        productPage
    ) {

        await this.waitForPageReady();


        const empty =
            await this.emptyCartMessage
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);


        if (!empty) {

            return;
        }


        console.log(
            '[EMPTY STATE DETECTED] Browsing cart is empty.'
        );


        await homepage.selectCategory(
            /laptops/i
        );


        await productPage
            .addFirstProductToCart();


        await productPage
            .navigateToCart();
    }


    // ============================================================
    // PROCEED TO CHECKOUT
    // ============================================================

    async proceedToCheckout() {

        console.log(
            'Proceeding to checkout...'
        );


        await this.checkoutButton.waitFor({

            state: 'visible',

            timeout: 10000
        });


        expect(
            await this.checkoutButton.isEnabled(),
            'Checkout button should be enabled.'
        ).toBeTruthy();


        await this.checkoutButton.click();


        await this.page.waitForLoadState(
            'domcontentloaded'
        );


        console.log(
            'Checkout navigation completed.'
        );
    }
}


module.exports = {
    CartPage
};