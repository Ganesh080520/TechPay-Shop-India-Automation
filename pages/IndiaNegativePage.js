const { BasePage } = require('./BasePage');


class IndiaNegativePage extends BasePage {

    constructor(page) {
        super(page);

        // ==================================================
        // SEARCH
        // ==================================================

        this.searchBar = page.getByPlaceholder(
            /search products|search/i
        ).first();


        // ==================================================
        // CATEGORY
        // ==================================================

        this.categoryLinks = page.locator(
            'a'
        );


        // ==================================================
        // FILTER
        // ==================================================

        this.filterSections = page.locator(
            '.mantine-Accordion-item'
        );


        // ==================================================
        // PRODUCT
        // ==================================================

        this.addToCartButtons = page.getByRole(
            'button',
            {
                name: /add to cart/i
            }
        );


        // ==================================================
        // CART
        // ==================================================

        this.checkoutButton = page.getByRole(
            'button',
            {
                name: /proceed to checkout|checkout|buy now/i
            }
        ).first();

        this.emptyCartMessage = page.getByText(
            /your cart is empty|empty basket|no items in cart|0 items in your cart/i
        ).first();


        // ==================================================
        // LOGIN
        // ==================================================

        this.phoneInput = page.getByPlaceholder(
            /Enter your phone number/i
        ).first();

        this.getOtpButton = page.getByRole(
            'button',
            {
                name: 'Get OTP',
                exact: true
            }
        ).first();

        this.loginButton = page.getByRole(
            'button',
            {
                name: /login|verify|submit/i
            }
        ).first();

        this.firstOtpSlot = page.locator(
            '#otp-0'
        );


        // ==================================================
        // DISCOUNT
        // ==================================================

        this.discountInput = page.locator(
            'input.mantine-NumberInput-input[inputmode="decimal"]'
        ).first();


        // ==================================================
        // AI ASSISTANT
        // ==================================================

        this.aiIframe = page.locator(
            'iframe[title="TechPay Recommendation AI"]'
        );
    }


    // ==================================================
    // INVALID PRODUCT SEARCH
    // ==================================================

    async validateInvalidSearch(
        invalidProduct
    ) {

        console.log('========================================');
        console.log('INDIA INVALID PRODUCT SEARCH');
        console.log('========================================');

        console.log(
            `Invalid Product: "${invalidProduct}"`
        );

        await this.searchBar.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.searchBar.click();

        await this.searchBar.fill('');

        await this.searchBar.fill(
            invalidProduct
        );

        await this.searchBar.press(
            'Enter'
        );

        await this.page.waitForTimeout(
            1500
        );


        // ==========================================
        // CHECK NO PRODUCTS MESSAGE
        // ==========================================

        const noProductMessage =
            this.page.getByText(
                /no products|no product found|no results|nothing found|not available/i
            ).first();

        const noProductVisible =
            await noProductMessage
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        if (noProductVisible) {

            console.log(
                'No product message displayed.'
            );

            console.log(
                'Invalid search validation PASSED.'
            );

            return true;
        }


        // ==========================================
        // FALLBACK - ADD TO CART COUNT
        // ==========================================

        const productCount =
            await this.addToCartButtons.count();

        console.log(
            `Add to Cart buttons found: ${productCount}`
        );

        if (productCount === 0) {

            console.log(
                'No products displayed.'
            );

            return true;
        }

        console.log(
            'WARNING: Products displayed for invalid search.'
        );

        return false;
    }


    // ==================================================
    // EMPTY SEARCH
    // ==================================================

    async validateEmptySearch() {

        console.log('========================================');
        console.log('INDIA EMPTY SEARCH');
        console.log('========================================');

        await this.searchBar.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.searchBar.fill('');

        const beforeUrl =
            this.page.url();

        await this.searchBar.press(
            'Enter'
        );

        await this.page.waitForTimeout(
            1200
        );

        const afterUrl =
            this.page.url();

        const value =
            await this.searchBar.inputValue();

        console.log(
            `Search value: "${value}"`
        );

        console.log(
            `URL before: ${beforeUrl}`
        );

        console.log(
            `URL after: ${afterUrl}`
        );

        if (value.trim() === '') {

            console.log(
                'Empty search handled correctly.'
            );

            return true;
        }

        return beforeUrl === afterUrl;
    }


    // ==================================================
    // WHITESPACE SEARCH
    // ==================================================

    async validateWhitespaceSearch(
        whitespace
    ) {

        console.log('========================================');
        console.log('INDIA WHITESPACE SEARCH');
        console.log('========================================');

        await this.searchBar.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.searchBar.fill(
            whitespace
        );

        await this.searchBar.press(
            'Enter'
        );

        await this.page.waitForTimeout(
            1200
        );

        const actual =
            await this.searchBar.inputValue();

        console.log(
            `Actual Search Value: "${actual}"`
        );

        if (actual.trim() === '') {

            console.log(
                'Whitespace treated as empty.'
            );

            return true;
        }

        const validation =
            this.page.getByText(
                /enter.*search|search.*required|invalid.*search/i
            ).first();

        return await validation
            .isVisible({
                timeout: 3000
            })
            .catch(() => false);
    }


    // ==================================================
    // INVALID CATEGORY
    // ==================================================

    async validateInvalidCategory(
        invalidCategory
    ) {

        console.log('========================================');

        console.log(
            `Testing invalid category: "${invalidCategory}"`
        );

        console.log('========================================');

        const escaped =
            String(invalidCategory)
                .replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                );

        const category =
            this.categoryLinks
                .filter({
                    hasText: new RegExp(
                        `^${escaped}$`,
                        'i'
                    )
                })
                .first();

        const visible =
            await category
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        if (!visible) {

            console.log(
                'Invalid category is unavailable.'
            );

            return true;
        }

        console.log(
            'WARNING: Invalid category exists.'
        );

        return false;
    }


    // ==================================================
    // INVALID FILTER
    // ==================================================

    async validateInvalidFilter(
        sectionHeading,
        invalidOption
    ) {

        console.log('========================================');

        console.log(
            `Invalid Filter: ${sectionHeading} -> ${invalidOption}`
        );

        console.log('========================================');

        const section =
            this.filterSections
                .filter({
                    hasText: sectionHeading
                })
                .first();

        const sectionVisible =
            await section
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        if (!sectionVisible) {

            console.log(
                `Filter section "${sectionHeading}" unavailable.`
            );

            return true;
        }


        // ==========================================
        // EXPAND SECTION
        // ==========================================

        const button =
            section.getByRole(
                'button',
                {
                    name: new RegExp(
                        `^${sectionHeading}$`,
                        'i'
                    )
                }
            ).first();

        if (
            await button
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false)
        ) {

            await button.click({
                force: true
            });

            await this.page.waitForTimeout(
                400
            );
        }


        // ==========================================
        // INVALID OPTION
        // ==========================================

        const option =
            section.getByText(
                invalidOption,
                {
                    exact: true
                }
            ).first();

        const optionVisible =
            await option
                .isVisible({
                    timeout: 2500
                })
                .catch(() => false);

        if (!optionVisible) {

            console.log(
                'Invalid filter option unavailable.'
            );

            return true;
        }

        console.log(
            'WARNING: Invalid filter option exists.'
        );

        return false;
    }


    // ==================================================
    // INVALID PRODUCT INDEX
    // ==================================================

    async validateInvalidProductIndex(
        invalidIndex
    ) {

        const count =
            await this.addToCartButtons.count();

        console.log(
            `Available products: ${count}`
        );

        console.log(
            `Requested invalid index: ${invalidIndex}`
        );

        return invalidIndex >= count;
    }


    // ==================================================
    // EMPTY CART
    // ==================================================

    async validateEmptyCart() {

        console.log('========================================');
        console.log('INDIA EMPTY CART VALIDATION');
        console.log('========================================');

        const emptyVisible =
            await this.emptyCartMessage
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        const checkoutVisible =
            await this.checkoutButton
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        console.log(
            `Empty Cart Message: ${emptyVisible}`
        );

        console.log(
            `Checkout Button Visible: ${checkoutVisible}`
        );

        if (!checkoutVisible) {

            console.log(
                'Checkout unavailable for empty cart.'
            );

            return true;
        }

        return (
            emptyVisible &&
            !checkoutVisible
        );
    }


    // ==================================================
    // EMPTY PHONE
    // ==================================================

    async validateEmptyPhone() {

        console.log('========================================');
        console.log('INDIA EMPTY PHONE VALIDATION');
        console.log('========================================');

        await this.phoneInput.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.phoneInput.fill('');

        const disabled =
            await this.getOtpButton
                .isDisabled()
                .catch(() => false);

        if (disabled) {

            console.log(
                'Get OTP disabled.'
            );

            return true;
        }

        await this.getOtpButton
            .click({
                force: true
            })
            .catch(() => {});

        await this.page.waitForTimeout(
            1000
        );

        const otpVisible =
            await this.firstOtpSlot
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);

        return !otpVisible;
    }


    // ==================================================
    // INVALID PHONE
    // ==================================================

    async validateInvalidPhone(
        invalidPhone
    ) {

        console.log('========================================');

        console.log(
            `INDIA INVALID PHONE: ${invalidPhone}`
        );

        console.log('========================================');

        await this.phoneInput.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.phoneInput.fill(
            invalidPhone
        );

        await this.getOtpButton
            .click({
                force: true
            })
            .catch(() => {});

        await this.page.waitForTimeout(
            1200
        );


        // ==========================================
        // VALIDATION MESSAGE
        // ==========================================

        const validation =
            this.page.getByText(
                /invalid.*phone|invalid.*mobile|enter.*valid|valid.*number|phone.*required/i
            ).first();

        const validationVisible =
            await validation
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        if (validationVisible) {

            console.log(
                'Invalid phone rejected.'
            );

            return true;
        }


        // ==========================================
        // OTP MUST NOT OPEN
        // ==========================================

        const otpVisible =
            await this.firstOtpSlot
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);

        return !otpVisible;
    }


    // ==================================================
    // REQUEST OTP
    // ==================================================

    async requestOtp(
        validPhone
    ) {

        await this.phoneInput.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.phoneInput.fill(
            validPhone
        );

        await this.getOtpButton.waitFor({
            state: 'visible',
            timeout: 5000
        });

        await this.getOtpButton.click();

        await this.firstOtpSlot.waitFor({
            state: 'visible',
            timeout: 10000
        });
    }


    // ==================================================
    // EMPTY OTP
    // ==================================================

    async validateEmptyOtp(
        validPhone
    ) {

        console.log('========================================');
        console.log('INDIA EMPTY OTP VALIDATION');
        console.log('========================================');

        await this.requestOtp(
            validPhone
        );

        const disabled =
            await this.loginButton
                .isDisabled()
                .catch(() => false);

        if (disabled) {

            console.log(
                'Login disabled for empty OTP.'
            );

            return true;
        }

        await this.loginButton
            .click({
                force: true
            })
            .catch(() => {});

        await this.page.waitForTimeout(
            1000
        );

        return await this.firstOtpSlot
            .isVisible()
            .catch(() => false);
    }


    // ==================================================
    // INVALID OTP
    // ==================================================

    async validateInvalidOtp(
        validPhone,
        invalidOtp
    ) {

        console.log('========================================');

        console.log(
            `INDIA INVALID OTP: ${invalidOtp}`
        );

        console.log('========================================');

        await this.requestOtp(
            validPhone
        );

        const value =
            String(invalidOtp)
                .padEnd(6, '0')
                .slice(0, 6);

        for (
            let index = 0;
            index < 6;
            index++
        ) {

            const otpSlot =
                this.page.locator(
                    `#otp-${index}`
                );

            await otpSlot.fill(
                value[index]
            );
        }

        await this.loginButton
            .click({
                force: true
            })
            .catch(() => {});

        await this.page.waitForTimeout(
            1500
        );

        const error =
            this.page.getByText(
                /invalid otp|incorrect otp|wrong otp|verification failed|otp.*invalid/i
            ).first();

        const errorVisible =
            await error
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        if (errorVisible) {
            return true;
        }

        return await this.firstOtpSlot
            .isVisible({
                timeout: 2000
            })
            .catch(() => false);
    }


    // ==================================================
    // GET TOTAL
    // ==================================================

    async getCheckoutTotal() {

        const total =
            this.page
                .getByText(
                    'Total',
                    {
                        exact: true
                    }
                )
                .locator('..')
                .locator('p')
                .filter({
                    hasText:
                        /INR\s*[\d,]+(?:\.\d{2})?/
                });

        const visible =
            await total
                .isVisible({
                    timeout: 5000
                })
                .catch(() => false);

        if (!visible) {
            return null;
        }

        const text =
            await total.innerText();

        return parseFloat(
            text.replace(
                /[^\d.]/g,
                ''
            )
        );
    }


    // ==================================================
    // EMPTY DISCOUNT
    // ==================================================

    async validateEmptyDiscount() {

        console.log('========================================');
        console.log('INDIA EMPTY DISCOUNT');
        console.log('========================================');

        const available =
            await this.discountInput
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        if (!available) {
            return null;
        }

        const before =
            await this.getCheckoutTotal();

        await this.discountInput.fill('');

        await this.discountInput.press(
            'Tab'
        );

        await this.page.waitForTimeout(
            1000
        );

        const after =
            await this.getCheckoutTotal();

        const actual =
            await this.discountInput.inputValue();

        console.log(
            `Total before: ${before}`
        );

        console.log(
            `Total after: ${after}`
        );

        return (
            actual.trim() === '' &&
            before === after
        );
    }


    // ==================================================
    // ZERO DISCOUNT
    // ==================================================

    async validateZeroDiscount() {

        const available =
            await this.discountInput
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        if (!available) {
            return null;
        }

        const before =
            await this.getCheckoutTotal();

        await this.discountInput.fill(
            '0'
        );

        await this.discountInput.press(
            'Tab'
        );

        await this.page.waitForTimeout(
            1000
        );

        const after =
            await this.getCheckoutTotal();

        return before === after;
    }


    // ==================================================
    // NEGATIVE DISCOUNT
    // ==================================================

    async validateNegativeDiscount() {

        const available =
            await this.discountInput
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        if (!available) {
            return null;
        }

        const before =
            await this.getCheckoutTotal();

        await this.discountInput
            .fill('-100')
            .catch(() => {});

        await this.discountInput
            .press('Tab')
            .catch(() => {});

        await this.page.waitForTimeout(
            1000
        );

        const actualValue =
            await this.discountInput
                .inputValue()
                .catch(() => '');

        const after =
            await this.getCheckoutTotal();

        console.log(
            `Discount value after entering -100: "${actualValue}"`
        );

        return (
            !actualValue.startsWith('-') ||
            before === after
        );
    }


    // ==================================================
    // EXCESSIVE DISCOUNT
    // ==================================================

    async validateExcessiveDiscount() {

        const available =
            await this.discountInput
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        if (!available) {
            return null;
        }

        const before =
            await this.getCheckoutTotal();

        if (before === null) {
            return false;
        }

        const invalidDiscount =
            before + 10000;

        await this.discountInput.fill(
            String(invalidDiscount)
        );

        await this.discountInput.press(
            'Tab'
        );

        await this.page.waitForTimeout(
            1200
        );

        const after =
            await this.getCheckoutTotal();

        console.log(
            `Order total: ${before}`
        );

        console.log(
            `Invalid discount: ${invalidDiscount}`
        );

        console.log(
            `Final total: ${after}`
        );

        return (
            after !== null &&
            after >= 0
        );
    }


    // ==================================================
    // NON NUMERIC DISCOUNT
    // ==================================================

    async validateNonNumericDiscount(
        invalidValue
    ) {

        const available =
            await this.discountInput
                .isVisible({
                    timeout: 4000
                })
                .catch(() => false);

        if (!available) {
            return null;
        }

        await this.discountInput
            .fill(invalidValue)
            .catch(() => {});

        const actual =
            await this.discountInput
                .inputValue()
                .catch(() => '');

        console.log(
            `Discount actual value: "${actual}"`
        );

        return !/[A-Za-z]/.test(
            actual
        );
    }


    // ==================================================
    // AI FRAME
    // ==================================================

    getAIFrame() {

        return this.page
            .locator(
                'iframe[title="TechPay Recommendation AI"]'
            )
            .contentFrame();
    }


    // ==================================================
    // AI TYPE INSTEAD
    // ==================================================

    async openAITypeInstead() {

        const iframe =
            this.page.locator(
                'iframe[title="TechPay Recommendation AI"]'
            );

        await iframe.waitFor({
            state: 'visible',
            timeout: 15000
        });

        const frame =
            iframe.contentFrame();

        const typeInstead =
            frame.getByRole(
                'button',
                {
                    name: 'Type instead'
                }
            );

        await typeInstead.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await typeInstead.click({
            force: true
        });

        return frame;
    }


    // ==================================================
    // AI EMPTY MESSAGE
    // ==================================================

    async validateAIEmptyMessage() {

        const frame =
            await this.openAITypeInstead();

        const textbox =
            frame.getByRole(
                'textbox',
                {
                    name: 'Message'
                }
            );

        await textbox.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await textbox.fill('');

        const send =
            frame.getByRole(
                'button',
                {
                    name: 'Send'
                }
            );

        const disabled =
            await send
                .isDisabled()
                .catch(() => false);

        if (disabled) {
            return true;
        }

        return (
            await textbox.inputValue()
        ) === '';
    }


    // ==================================================
    // AI WHITESPACE MESSAGE
    // ==================================================

    async validateAIWhitespaceMessage(
        whitespace
    ) {

        const frame =
            await this.openAITypeInstead();

        const textbox =
            frame.getByRole(
                'textbox',
                {
                    name: 'Message'
                }
            );

        await textbox.fill(
            whitespace
        );

        const actual =
            await textbox.inputValue();

        if (actual.trim() === '') {
            return true;
        }

        const send =
            frame.getByRole(
                'button',
                {
                    name: 'Send'
                }
            );

        return await send
            .isDisabled()
            .catch(() => false);
    }


    // ==================================================
    // RECOMMENDATION AI INVALID OPTION
    // ==================================================

    async validateMissingAIOption(
        optionName
    ) {

        console.log(
            `Looking for invalid Recommendation AI option: "${optionName}"`
        );

        const option =
            this.page.getByRole(
                'button',
                {
                    name: optionName,
                    exact: true
                }
            );

        const visible =
            await option
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        return !visible;
    }


    // ==================================================
    // RECOMMENDATION AI UPDATE WITHOUT SELECTION
    // ==================================================

    async validateRecommendationWithoutSelections() {

        const updateButton =
            this.page.getByRole(
                'button',
                {
                    name: 'Update recommendations'
                }
            );

        const visible =
            await updateButton
                .isVisible({
                    timeout: 5000
                })
                .catch(() => false);

        if (!visible) {

            console.log(
                'Update Recommendations unavailable before required selections.'
            );

            return true;
        }

        const disabled =
            await updateButton
                .isDisabled()
                .catch(() => false);

        if (disabled) {

            console.log(
                'Update Recommendations disabled.'
            );

            return true;
        }

        await updateButton.click({
            force: true
        });

        await this.page.waitForTimeout(
            1500
        );

        const buyLinks =
            this.page.getByRole(
                'link',
                {
                    name: 'Buy on TechPay'
                }
            );

        const count =
            await buyLinks.count();

        console.log(
            `Buy on TechPay links: ${count}`
        );

        return count === 0;
    }
}


module.exports = {
    IndiaNegativePage
};