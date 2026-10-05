const { BasePage } = require('./BasePage');
const { expect } = require('@playwright/test');
const { PaymentGatewayPage } = require('./PaymentGatewayPage');

class CheckoutPage extends BasePage {

    constructor(page) {
        super(page);

        this.discountInput = page.locator(
            'input.mantine-NumberInput-input[inputmode="decimal"]'
        ).first();

        this.payOnlineButton = page.getByRole('button', {
            name: /Pay Now|Pay INR|Pay Online/i
        }).first();

        this.payOfflineButton = page.getByRole('button', {
            name: /Pay Offline/i
        }).first();

        this.payOnlineText = page.getByText(
            /Pay Now|Pay INR|Pay Online/i
        ).first();

        this.payOfflineText = page.getByText(
            /Pay Offline/i
        ).first();

        this.customPriceInput = page.locator(
            'input[placeholder="Enter amount"]'
        ).first();

        this.applyPriceButton = page.getByRole(
            'button',
            { name: /^Apply Price$/i }
        ).last();
    }

    // ==========================================
    // WAIT FOR CHECKOUT PAGE
    // ==========================================

    async waitForCheckoutPage() {

        console.log('Waiting for checkout page...');

        await this.page
            .waitForLoadState('domcontentloaded')
            .catch(() => null);

        await this.page.waitForTimeout(1500);

        console.log(
            'Current checkout URL:',
            this.page.url()
        );
    }

    // ==========================================
    // DISCOUNT FIELD
    // ==========================================

    async isDiscountAvailable() {

        console.log('Checking discount...');

        const discountInput = this.page.locator(
            'input.mantine-NumberInput-input'
        ).first();

        const visible = await discountInput
            .isVisible({
                timeout: 3000
            })
            .catch(() => false);

        if (visible) {

            console.log(
                'Discount field available.'
            );

            return true;
        }

        console.log(
            'Discount field not available.'
        );

        return false;
    }

    // ==========================================
    // GET TOTAL AMOUNT
    // ==========================================

    async getTotalAmount() {

        const totalAmount = this.page
            .locator('p')
            .filter({
                hasText: /^INR\s*[\d,]+\.\d{2}\s*$/
            })
            .last();

        const visible = await totalAmount
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);

        if (!visible) {

            console.log(
                'Total amount could not be detected.'
            );

            return null;
        }

        const text = await totalAmount.innerText();

        console.log(
            `Current total amount: ${text}`
        );

        const amount = parseFloat(
            text
                .replace(/INR/g, '')
                .replace(/,/g, '')
                .trim()
        );

        return amount;
    }

    // ==========================================
    // APPLY DISCOUNT AND VERIFY TOTAL
    // ==========================================

   async applyDiscountAndVerify(discountAmount) {

    console.log(
        '========================================'
    );

    console.log(
        'CHECKING DISCOUNT'
    );

    console.log(
        '========================================'
    );


    // =====================================================
    // LOCATE DISCOUNT FIELD
    // =====================================================

    const discountInput = this.page
        .locator(
            'input[placeholder*="discount" i], ' +
            'input[placeholder*="amount" i]'
        )
        .first();


    const discountAvailable =
        await discountInput
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);


    if (!discountAvailable) {

        console.log(
            'Discount field is not available.'
        );

        return false;
    }


    console.log(
        'Discount field available.'
    );


    // =====================================================
    // LOCATE TOTAL SECTION
    // =====================================================

    const totalLabel = this.page
        .getByText(
            'Total',
            {
                exact: true
            }
        )
        .last();


    await totalLabel.waitFor({

        state: 'visible',

        timeout: 10000
    });


    // =====================================================
    // GET TOTAL CONTAINER
    // =====================================================

    const totalContainer =
        totalLabel.locator('..');


    // =====================================================
    // FIND ₹ / INR AMOUNT
    //
    // Supports:
    // ₹ 48,500.00
    // ₹48,500
    // INR 48,500.00
    // INR48,500
    // =====================================================

    const totalAmount = totalContainer
        .getByText(
            /(?:₹|INR)\s*[\d,]+(?:\.\d{1,2})?/i
        )
        .last();


    await totalAmount.waitFor({

        state: 'visible',

        timeout: 10000
    });


    // =====================================================
    // READ ORIGINAL TOTAL
    // =====================================================

    const originalTotalText =
        await totalAmount.innerText();


    console.log(
        `Original total text: ${originalTotalText}`
    );


    const originalTotal =
        this.extractAmount(
            originalTotalText
        );


    console.log(
        `Original Total: ₹${originalTotal}`
    );


    // =====================================================
    // ENTER DISCOUNT
    // =====================================================

    console.log(
        `Entering discount amount: ₹${discountAmount}`
    );


    await discountInput.fill(
        String(discountAmount)
    );


    // =====================================================
    // LOCATE APPLY BUTTON
    // =====================================================

    const applyButton = this.page
        .getByRole(
            'button',
            {
                name: /^Apply$/i
            }
        )
        .first();


    await applyButton.waitFor({

        state: 'visible',

        timeout: 10000
    });


    console.log(
        'Clicking Apply...'
    );


    await applyButton.click();


    // =====================================================
    // CALCULATE EXPECTED TOTAL
    // =====================================================

    const expectedTotal =
        originalTotal - discountAmount;


    console.log(
        `Expected Total After Discount: ₹${expectedTotal}`
    );


    // =====================================================
    // WAIT FOR TOTAL TO UPDATE
    //
    // Re-read DOM every time because React may re-render
    // the checkout total after applying discount.
    // =====================================================

    await expect.poll(

        async () => {

            const refreshedTotalLabel =
                this.page
                    .getByText(
                        'Total',
                        {
                            exact: true
                        }
                    )
                    .last();


            const refreshedContainer =
                refreshedTotalLabel
                    .locator('..');


            const refreshedAmount =
                refreshedContainer
                    .getByText(
                        /(?:₹|INR)\s*[\d,]+(?:\.\d{1,2})?/i
                    )
                    .last();


            const text =
                await refreshedAmount
                    .innerText()
                    .catch(() => '');


            if (!text) {

                return null;
            }


            return this.extractAmount(
                text
            );
        },

        {
            message:
                'Waiting for checkout total to update after discount',

            timeout: 15000
        }

    ).toBe(
        expectedTotal
    );


    // =====================================================
    // READ FINAL TOTAL
    // =====================================================

    const finalTotalLabel =
        this.page
            .getByText(
                'Total',
                {
                    exact: true
                }
            )
            .last();


    const finalTotalContainer =
        finalTotalLabel
            .locator('..');


    const finalTotalAmount =
        finalTotalContainer
            .getByText(
                /(?:₹|INR)\s*[\d,]+(?:\.\d{1,2})?/i
            )
            .last();


    const finalTotalText =
        await finalTotalAmount
            .innerText();


    const finalTotal =
        this.extractAmount(
            finalTotalText
        );


    console.log(
        `Final Total: ₹${finalTotal}`
    );


    // =====================================================
    // FINAL ASSERTION
    // =====================================================

    expect(
        finalTotal,
        'Checkout total should decrease by the entered discount amount.'
    ).toBe(
        expectedTotal
    );


    console.log(
        'Discount applied successfully.'
    );


    console.log(
        `₹${originalTotal} - ₹${discountAmount} = ₹${finalTotal}`
    );


    console.log(
        '========================================'
    );


    return true;
}
    // ==========================================
    // PAY ONLINE AVAILABILITY
    // ==========================================

    async isPayOnlineAvailable() {

        const buttonVisible =
            await this.payOnlineButton
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        if (buttonVisible) {

            console.log(
                'Pay Online available: true'
            );

            return true;
        }

        const textVisible =
            await this.payOnlineText
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);

        console.log(
            `Pay Online available: ${textVisible}`
        );

        return textVisible;
    }

    // ==========================================
    // PAY OFFLINE AVAILABILITY
    // ==========================================

    async isPayOfflineAvailable() {

        const buttonVisible =
            await this.payOfflineButton
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        if (buttonVisible) {

            console.log(
                'Pay Offline available: true'
            );

            return true;
        }

        const textVisible =
            await this.payOfflineText
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);

        console.log(
            `Pay Offline available: ${textVisible}`
        );

        return textVisible;
    }

    // ==========================================
    // GET PAYMENT OPTIONS
    // ==========================================

    async getPaymentOptions() {

        await this.waitForCheckoutPage();

        const payOnline =
            await this.isPayOnlineAvailable();

        const payOffline =
            await this.isPayOfflineAvailable();

        console.log(
            `Payment options -> Online: ${payOnline}, Offline: ${payOffline}`
        );

        return {
            payOnline,
            payOffline
        };
    }

    // ==========================================
    // CUSTOM PRICE POPUP
    // ==========================================

    async isCustomPricePopupVisible() {

        const inputVisible =
            await this.customPriceInput
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);

        if (inputVisible) {

            console.log(
                'Custom price popup detected.'
            );

            return true;
        }

        console.log(
            'No custom price popup detected.'
        );

        return false;
    }

    // ==========================================
    // HANDLE CUSTOM PRICE
    // ==========================================

    async handleCustomPriceIfPresent(
        customPrice = 50000
    ) {

        console.log(
            'Checking whether custom price is required...'
        );

        const popupVisible =
            await this.isCustomPricePopupVisible();

        if (!popupVisible) {

            console.log(
                'No custom price required for this store.'
            );

            return false;
        }

        console.log(
            `Custom price popup detected. Entering ₹${customPrice}`
        );

        await this.customPriceInput.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.customPriceInput.fill(
            String(customPrice)
        );

        console.log(
            `Custom price entered: ₹${customPrice}`
        );

        await this.applyPriceButton.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.applyPriceButton.click();

        console.log(
            'Apply Price clicked.'
        );

        await this.customPriceInput
            .waitFor({
                state: 'hidden',
                timeout: 10000
            })
            .catch(() => null);

        await this.page.waitForTimeout(2000);

        console.log(
            'Custom price flow completed.'
        );

        return true;
    }

    // ==========================================
    // WAIT FOR PAYMENT GATEWAY
    // ==========================================

    async waitForPaymentGateway() {

        console.log(
            'Checking for payment gateway...'
        );

        const paymentGateway =
            new PaymentGatewayPage(this.page);

        const gatewayReady =
            await paymentGateway.waitForGateway();

        return {
            gateway: paymentGateway,
            ready: gatewayReady
        };
    }

    // ==========================================
    // PAY ONLINE
    // ==========================================

    async clickPayOnline(
        customPrice = 45000
    ) {

        console.log(
            'STARTING PAY ONLINE FLOW'
        );

        const payNowButton =
            this.page
                .getByRole(
                    'button',
                    {
                        name: /Pay Now/i
                    }
                )
                .first();

        const payNowAvailable =
            await payNowButton
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);

        if (!payNowAvailable) {

            console.log(
                'Pay Now is not available.'
            );

            console.log(
                'Pay Online flow cannot continue.'
            );

            return null;
        }

        console.log(
            'Pay Now available. Clicking Pay Now...'
        );

        await payNowButton.click();

        console.log(
            'Pay Now clicked.'
        );

        await this.page.waitForTimeout(1500);

        // ==========================================
        // CHECK CUSTOM PRICE
        // ==========================================

        console.log(
            'Checking for custom price popup...'
        );

        const orderTotalInput =
            this.page
                .getByRole(
                    'textbox',
                    {
                        name: 'Order total'
                    }
                )
                .first();

        const customPriceVisible =
            await orderTotalInput
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);

        if (customPriceVisible) {

            console.log(
                'Custom price popup detected.'
            );

            console.log(
                `Entering custom price: ₹${customPrice}`
            );

            await orderTotalInput.fill(
                String(customPrice)
            );

            console.log(
                'Order Total entered.'
            );

            const applyPriceButton =
                this.page
                    .getByRole(
                        'button',
                        {
                            name: 'Apply Price'
                        }
                    )
                    .first();

            await applyPriceButton.waitFor({
                state: 'visible',
                timeout: 10000
            });

            await applyPriceButton.click();

            console.log(
                'Apply Price clicked.'
            );

            await this.page.waitForTimeout(2000);

        } else {

            console.log(
                'Custom price popup not present.'
            );
        }

        // ==========================================
        // PAYMENT GATEWAY
        // ==========================================

        console.log(
            'Waiting for payment method screen...'
        );

        const paymentGateway =
            new PaymentGatewayPage(
                this.page
            );

        const paymentReady =
            await paymentGateway
                .waitForPaymentScreen();

        if (!paymentReady) {

            throw new Error(
                'Payment method screen did not appear after Pay Now/custom price flow.'
            );
        }

        console.log(
            'Payment method screen ready.'
        );

        return paymentGateway;
    }

    // ==========================================
    // PAY OFFLINE
    // ==========================================

    async clickPayOffline() {

        console.log(
            'PROCESSING PAY OFFLINE'
        );

        const available =
            await this.isPayOfflineAvailable();

        if (!available) {

            throw new Error(
                'Pay Offline is not available for this store.'
            );
        }

        if (
            await this.payOfflineButton
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false)
        ) {

            await this.payOfflineButton.click({
                force: true
            });

        } else {

            await this.payOfflineText.click({
                force: true
            });
        }

        console.log(
            'Pay Offline clicked.'
        );

        await this.page.waitForTimeout(1500);

        console.log(
            'Pay Offline flow completed.'
        );
    }

    // ==========================================
    // PROCESS AVAILABLE PAYMENT METHOD
    // ==========================================

    async processAvailablePaymentMethod(
        customPrice = 50000,
        paymentMethod = 'Cards',
        subPaymentMethod = 'RuPay Debit Card'
    ) {

        console.log(
            'AUTOMATIC PAYMENT ROUTING'
        );

        const supportedPaymentMethods = [
            'UPI',
            'Cards',
            'Net Banking',
            'Wallets',
            'EMI'
        ];

        const normalizedPaymentMethod =
            supportedPaymentMethods.find(
                method =>
                    method.toLowerCase() ===
                    String(paymentMethod)
                        .trim()
                        .toLowerCase()
            );

        if (!normalizedPaymentMethod) {

            throw new Error(
                `Unsupported payment method: ${paymentMethod}. ` +
                `Supported methods: ${supportedPaymentMethods.join(', ')}`
            );
        }

        paymentMethod =
            normalizedPaymentMethod;

        console.log(
            `Requested payment method: ${paymentMethod}`
        );

        console.log(
            `Requested sub-payment method: ${subPaymentMethod}`
        );

        const payment =
            await this.getPaymentOptions();

        // ==========================================
        // PAY ONLINE
        // ==========================================

        if (payment.payOnline) {

            console.log(
                'Pay Online store detected.'
            );

            const paymentGateway =
                await this.clickPayOnline(
                    customPrice
                );

            console.log(
                `Selecting payment method: ${paymentMethod}`
            );

            const selected =
                await paymentGateway
                    .selectPaymentMethod(
                        paymentMethod,
                        subPaymentMethod
                    );

            if (!selected) {

                throw new Error(
                    `Payment method ${paymentMethod} could not be selected.`
                );
            }

            console.log(
                `${paymentMethod} payment method selected.`
            );

            const finalPaymentClicked =
                await paymentGateway
                    .clickFinalPayment();

            if (!finalPaymentClicked) {

                throw new Error(
                    'Final Pay INR button could not be clicked.'
                );
            }

            console.log(
                'Final payment button clicked.'
            );

            return {
                type: 'ONLINE',
                gateway: paymentGateway
            };
        }

        // ==========================================
        // PAY OFFLINE
        // ==========================================

        if (payment.payOffline) {

            console.log(
                'Pay Offline store detected.'
            );

            await this.clickPayOffline();

            return {
                type: 'OFFLINE',
                gateway: null
            };
        }

        // ==========================================
        // NO PAYMENT METHOD
        // ==========================================

        throw new Error(
            'FAIL: Neither Pay Online nor Pay Offline is available.'
        );
    }
}

module.exports = {
    CheckoutPage
};