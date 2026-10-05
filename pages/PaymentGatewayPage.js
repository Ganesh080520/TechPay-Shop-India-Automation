class PaymentGatewayPage {

    constructor(page) {

        this.page = page;

        this.orderTotalInput =
            page.getByRole('textbox', {
                name: 'Order total'
            });

        this.applyPriceButton =
            page.getByRole('button', {
                name: 'Apply Price'
            });

        this.upiButton =
            page.getByRole('button', {
                name: /UPI/i
            }).first();

        this.cardsButton =
            page.getByRole('button', {
                name: /Cards/i
            }).first();

        this.netBankingButton =
            page.getByRole('button', {
                name: /Net Banking/i
            }).first();

        this.walletsButton =
            page.getByRole('button', {
                name: /Wallets/i
            }).first();

        this.emiButton =
            page.getByRole('button', {
                name: /EMI/i
            }).first();

       this.payInrButton = page
    .getByRole('button', {
        name: /Pay\s*(?:INR|₹)/i
    })
    .last();
    }

    async waitForPaymentScreen() {

        console.log(
            'WAITING FOR PAYMENT METHOD SCREEN'
        );

        const timeout = 20000;
        const start = Date.now();

        while (Date.now() - start < timeout) {

            const paymentButtons = [

                this.upiButton,
                this.cardsButton,
                this.netBankingButton,
                this.walletsButton,
                this.emiButton,
                this.payInrButton

            ];

            for (const locator of paymentButtons) {

                const visible =
                    await locator
                        .isVisible({
                            timeout: 500
                        })
                        .catch(() => false);

                if (visible) {

                    console.log(
                        'Payment method screen detected.'
                    );

                    return true;
                }
            }

            const paymentText =
                this.page.getByText(
                    /UPI|Cards|Net Banking|Wallets|EMI|Pay Later|Pay INR/i
                ).first();

            const textVisible =
                await paymentText
                    .isVisible({
                        timeout: 500
                    })
                    .catch(() => false);

            if (textVisible) {

                console.log(
                    'Payment-related UI detected.'
                );

                return true;
            }


            await this.page.waitForTimeout(500);
        }


        console.log(
            'Payment method screen was not detected.'
        );

        console.log(
            'Current URL:',
            this.page.url()
        );

        console.log(
            'Open pages:',
            this.page.context().pages().length
        );


        for (const frame of this.page.frames()) {

            console.log(
                'FRAME:',
                frame.url()
            );
        }

        return false;
    }


    async handleCustomPrice(customPrice = null) {

        console.log(
            'Checking whether custom price is required...'
        );

        const inputVisible =
            await this.orderTotalInput
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);


        if (!inputVisible) {

            console.log(
                'No custom price required for this store.'
            );

            return false;
        }


        console.log(
            'Custom price popup detected.'
        );


        if (
            customPrice === null ||
            customPrice === undefined
        ) {

            throw new Error(
                'Custom price popup is displayed, but no customPrice was provided.'
            );
        }


        console.log(
            `Entering custom price: ${customPrice}`
        );


        await this.orderTotalInput.fill(
            String(customPrice)
        );


        console.log(
            'Custom price entered.'
        );


        await this.applyPriceButton.waitFor({
            state: 'visible',
            timeout: 10000
        });


        await this.applyPriceButton.click();


        console.log(
            'Apply Price clicked.'
        );


        await this.page.waitForTimeout(1500);

        return true;
    }


    async selectPaymentMethod(method) {

        if (!method) {

            throw new Error(
                'Payment method was not provided.'
            );
        }


        console.log(
            `Selecting payment method: "${method}"`
        );

        const methodKey =
            String(method)
                .trim()
                .toLowerCase();


        const paymentMethods = {

            'upi':
                this.upiButton,

            'cards':
                this.cardsButton,

            'net banking':
                this.netBankingButton,

            'netbanking':
                this.netBankingButton,

            'wallets':
                this.walletsButton,

            'wallet':
                this.walletsButton,

            'emi':
                this.emiButton

        };


        const paymentButton =
            paymentMethods[methodKey];


        if (!paymentButton) {

            throw new Error(
                `Unsupported payment method: "${method}". ` +
                `Supported methods: UPI, Cards, Net Banking, Wallets, EMI`
            );
        }

        const visible =
            await paymentButton
                .isVisible({
                    timeout: 5000
                })
                .catch(() => false);


        if (!visible) {

            console.log(
                `Payment method "${method}" is not available.`
            );

            return false;
        }

        await paymentButton
            .scrollIntoViewIfNeeded()
            .catch(() => {});


        await paymentButton.click({
            force: true
        });


        console.log(
            `Payment method selected: "${method}"`
        );


        await this.page.waitForTimeout(1000);


        return true;
    }

    async selectPaymentSubOption(subOption) {

        if (!subOption) {

            throw new Error(
                'Payment sub-option was not provided.'
            );
        }


        console.log(
            `Selecting payment sub-option: "${subOption}"`
        );


        const subOptionLocator =
            this.page
                .getByText(
                    subOption,
                    {
                        exact: true
                    }
                )
                .first();


        const visible =
            await subOptionLocator
                .isVisible({
                    timeout: 5000
                })
                .catch(() => false);


        if (!visible) {

            console.log(
                `Payment sub-option not found: "${subOption}"`
            );

            return false;
        }


        await subOptionLocator
            .scrollIntoViewIfNeeded()
            .catch(() => {});

        await subOptionLocator.click({
            force: true
        });


        console.log(
            `Payment sub-option selected: "${subOption}"`
        );


        await this.page.waitForTimeout(1000);


        return true;
    }

    async selectPaymentMethodWithSubOption(
        method,
        subOption
    ) {

        console.log(
            '========================================'
        );

        console.log(
            `PAYMENT METHOD: ${method}`
        );

        console.log(
            `PAYMENT SUB-OPTION: ${subOption}`
        );

        console.log(
            '========================================'
        );

        const methodSelected =
            await this.selectPaymentMethod(
                method
            );


        if (!methodSelected) {

            throw new Error(
                `Payment method "${method}" could not be selected.`
            );
        }

        const subOptionSelected =
            await this.selectPaymentSubOption(
                subOption
            );


        if (!subOptionSelected) {

            throw new Error(
                `Payment sub-option "${subOption}" ` +
                `could not be selected for "${method}".`
            );
        }


        console.log(
            '========================================'
        );

        console.log(
            'PAYMENT METHOD AND SUB-OPTION SELECTED'
        );

        console.log(
            '========================================'
        );


        return true;
    }


    async clickFinalPayment() {

    console.log(
        'Looking for final payment button...'
    );

    // =====================================================
    // PRIMARY LOCATOR
    //
    // Supports:
    // Pay INR
    // Pay INR 48,500
    // Pay INR 48500.00
    // Pay ₹48,500
    // Pay ₹ 48,500.00
    // =====================================================

    let payButton = this.page
        .getByRole('button', {
            name: /Pay\s*(?:INR|₹)/i
        })
        .last();


    let visible = await payButton
        .isVisible({
            timeout: 8000
        })
        .catch(() => false);


    // =====================================================
    // FALLBACK 1
    // Any visible button beginning with "Pay"
    // =====================================================

    if (!visible) {

        console.log(
            'Pay INR/₹ button not found. Trying generic Pay button...'
        );

        payButton = this.page
            .getByRole('button', {
                name: /^Pay\b/i
            })
            .last();


        visible = await payButton
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);
    }


    // =====================================================
    // FALLBACK 2
    // Button text locator
    // =====================================================

    if (!visible) {

        console.log(
            'Role-based Pay button not found. Trying text locator...'
        );

        payButton = this.page
            .locator('button')
            .filter({
                hasText: /Pay/i
            })
            .last();


        visible = await payButton
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);
    }


    // =====================================================
    // BUTTON NOT FOUND
    // =====================================================

    if (!visible) {

        // Print available buttons to make future debugging easier.

        const buttons = this.page
            .getByRole('button');

        const count = await buttons.count();

        console.log(
            `Visible payment-page buttons detected: ${count}`
        );


        for (let i = 0; i < count; i++) {

            const button = buttons.nth(i);

            const isVisible = await button
                .isVisible()
                .catch(() => false);


            if (!isVisible) {
                continue;
            }


            const text = await button
                .innerText()
                .catch(() => '');


            console.log(
                `Button ${i}: "${text.trim()}"`
            );
        }


        throw new Error(
            'Final payment button could not be located after selecting the payment method.'
        );
    }


    // =====================================================
    // BUTTON FOUND
    // =====================================================

    await payButton.scrollIntoViewIfNeeded();


    const buttonText = await payButton
        .innerText()
        .catch(() => 'Pay');


    console.log(
        `Final payment button found: "${buttonText.trim()}"`
    );


    // =====================================================
    // CHECK BUTTON STATE
    // =====================================================

    const enabled = await payButton
        .isEnabled()
        .catch(() => false);


    if (!enabled) {

        throw new Error(
            `Final payment button "${buttonText.trim()}" is disabled.`
        );
    }


    console.log(
        'Final payment button is enabled.'
    );


    // =====================================================
    // IMPORTANT
    //
    // Clicking this button can trigger a real payment action.
    // For a QA automation environment, only perform the click
    // when this is an approved sandbox/test payment gateway.
    // =====================================================

    console.log(
        'Final payment button is ready.'
    );


    return true;
}
}


module.exports = {
    PaymentGatewayPage
};