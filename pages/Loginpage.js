const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {

    constructor(page) {

        super(page);

        // ====================================================
        // LOGIN LOCATORS
        // ====================================================

        this.phoneInput =
            page.getByPlaceholder(
                /Enter your phone number/i
            );

        this.signInButton =
            page.getByRole(
                'button',
                {
                    name: 'Sign In',
                    exact: true
                }
            );

        this.getOtpButton =
            page.getByRole(
                'button',
                {
                    name: 'Get OTP',
                    exact: true
                }
            );

        this.firstOtpSlot =
            page.locator('#otp-0');

        this.loginButton =
            page.getByRole(
                'button',
                {
                    name: /login|verify|submit/i
                }
            ).first();
    }


    // ========================================================
    // LOGIN WITH MANUAL OTP
    // ========================================================

    async loginWithManualOtp(phoneNumber) {

        console.log(
            'Starting checkout login...'
        );


        // ----------------------------------------------------
        // CHECK WHETHER LOGIN MODAL IS ALREADY OPEN
        // ----------------------------------------------------

        let phoneVisible =
            await this.phoneInput
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);


        // ----------------------------------------------------
        // OPEN LOGIN MODAL
        // ----------------------------------------------------

        if (!phoneVisible) {

            console.log(
                'Login modal not visible. Looking for Sign In button...'
            );


            await this.signInButton.waitFor({
                state: 'visible',
                timeout: 10000
            });


            console.log(
                'Sign In button found.'
            );


            await this.signInButton.click({
                force: true
            });


            console.log(
                'Sign In button clicked.'
            );


            await this.page.waitForTimeout(
                500
            );
        }


        // ----------------------------------------------------
        // WAIT FOR PHONE NUMBER FIELD
        // ----------------------------------------------------

        await this.phoneInput.waitFor({
            state: 'visible',
            timeout: 10000
        });


        console.log(
            'Login modal is visible.'
        );


        // ----------------------------------------------------
        // ENTER MOBILE NUMBER
        // ----------------------------------------------------

        await this.phoneInput.fill(
            phoneNumber
        );


        console.log(
            'Phone number entered.'
        );


        // ----------------------------------------------------
        // CLICK GET OTP
        // ----------------------------------------------------

        await this.getOtpButton.waitFor({
            state: 'visible',
            timeout: 5000
        });


        await this.getOtpButton.click();


        console.log(
            'Get OTP clicked.'
        );


        // ----------------------------------------------------
        // WAIT FOR OTP FIELD
        // ----------------------------------------------------

        await this.firstOtpSlot.waitFor({
            state: 'visible',
            timeout: 10000
        });


        await this.firstOtpSlot.focus();


        // ----------------------------------------------------
        // MANUAL OTP ENTRY
        // ----------------------------------------------------

        console.log(
            '\n[AUTOMATION PAUSED] Enter the 6-digit OTP and click Resume.'
        );


        await this.page.pause();


        console.log(
            'OTP entered. Looking for Login/Verify button...'
        );


        await this.page.waitForTimeout(
            500
        );


        // ----------------------------------------------------
        // CLICK LOGIN / VERIFY
        // ----------------------------------------------------

        const loginVisible =
            await this.loginButton
                .isVisible({
                    timeout: 5000
                })
                .catch(() => false);


        if (loginVisible) {

            console.log(
                'Login/Verify button found.'
            );


            await this.loginButton.click({
                force: true
            });


            console.log(
                'Login/Verify button clicked.'
            );

        }

        else {

            console.log(
                'Login/Verify button not found. Pressing Enter...'
            );


            await this.page.keyboard.press(
                'Enter'
            );
        }


        // ----------------------------------------------------
        // WAIT FOR LOGIN PROCESS
        // ----------------------------------------------------

        await this.page.waitForTimeout(
            1500
        );


        await this.page
            .waitForLoadState(
                'domcontentloaded'
            )
            .catch(() => null);


        console.log(
            'Current URL after login:',
            this.page.url()
        );


        console.log(
            'Login process completed.'
        );


        return true;
    }


    // ========================================================
    // BACKWARD-COMPATIBLE METHOD
    // ========================================================
    //
    // Some older tests may still call loginWithAutoOtp().
    // Keep this wrapper so those tests don't break.
    // ========================================================

    async loginWithAutoOtp(phoneNumber) {

        console.log(
            'Redirecting loginWithAutoOtp() to manual OTP flow...'
        );


        return await this.loginWithManualOtp(
            phoneNumber
        );
    }


    // ========================================================
    // HANDLE REPLACE CART MODAL AFTER LOGIN
    // ========================================================

    async handleReplaceCartModal() {

        console.log(
            'Checking for Replace Cart modal...'
        );


        // ----------------------------------------------------
        // LOCATE REPLACE CART HEADING
        // ----------------------------------------------------

        const replaceCartHeading =
            this.page.getByRole(
                'heading',
                {
                    name: /Replace Cart\?/i
                }
            );


        // ----------------------------------------------------
        // WAIT BRIEFLY FOR MODAL
        //
        // This modal only appears when the logged-in account
        // contains cart items from another store.
        // ----------------------------------------------------

        const modalVisible =
            await replaceCartHeading
                .isVisible({
                    timeout: 5000
                })
                .catch(() => false);


        // ----------------------------------------------------
        // NO REPLACE CART MODAL
        // ----------------------------------------------------

        if (!modalVisible) {

            console.log(
                'Replace Cart modal did not appear.'
            );


            console.log(
                'Continuing checkout normally.'
            );


            return false;
        }


        // ----------------------------------------------------
        // MODAL DETECTED
        // ----------------------------------------------------

        console.log(
            'Replace Cart modal detected.'
        );


        // ----------------------------------------------------
        // CHECK MODAL MESSAGE
        // ----------------------------------------------------

        const modalMessage =
            this.page.getByText(
                /Your account cart has items from another store/i
            );


        const messageVisible =
            await modalMessage
                .isVisible()
                .catch(() => false);


        if (messageVisible) {

            console.log(
                'Existing account cart from another store detected.'
            );
        }


        // ----------------------------------------------------
        // LOCATE "YES, USE BROWSING CART"
        // ----------------------------------------------------

        const useBrowsingCartButton =
            this.page.getByRole(
                'button',
                {
                    name: /Yes,\s*Use Browsing Cart/i
                }
            );


        await useBrowsingCartButton.waitFor({
            state: 'visible',
            timeout: 10000
        });


        await useBrowsingCartButton
            .scrollIntoViewIfNeeded();


        console.log(
            'Selecting "Yes, Use Browsing Cart"...'
        );


        // ----------------------------------------------------
        // USE CURRENT BROWSING CART
        // ----------------------------------------------------

        await useBrowsingCartButton.click();


        // ----------------------------------------------------
        // VERIFY MODAL CLOSES
        // ----------------------------------------------------

        await replaceCartHeading.waitFor({
            state: 'hidden',
            timeout: 10000
        });


        console.log(
            'Browsing cart selected successfully.'
        );


        console.log(
            'Replace Cart modal closed.'
        );


        return true;
    }
}


module.exports = {
    LoginPage
};