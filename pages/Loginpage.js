const { expect } = require('@playwright/test');

const { BasePage } = require('./BasePage'); 

class LoginPage extends BasePage {
  constructor(page) {
    super(page); 
    this.phoneInput = page.getByPlaceholder(/Enter your phone number/i);
    this.signInButton = page.getByRole('button', {name: 'Sign In',exact: true});
    this.getOtpButton = page.getByRole('button', { name: 'Get OTP', exact: true });
    this.firstOtpSlot = page.locator('#otp-0');
    this.loginButton = page.getByRole('button', {name: /login|verify|submit/i}).first();
    this.verifyButton = page.getByRole('button', { name: /verify|submit|login/i });
  }

async loginWithAutoOtp(phoneNumber) {

    console.log('Starting checkout login...');

    let phoneVisible = await this.phoneInput
        .isVisible({
            timeout: 2000
        })
        .catch(() => false);

    if (!phoneVisible) {

        console.log('Login modal not visible. Looking for Sign In button...');

        await this.signInButton.waitFor({state: 'visible',timeout: 10000});

        console.log('Sign In button found.');

        await this.signInButton.click({force: true});

        console.log('Sign In button clicked.');

        await this.page.waitForTimeout(500);
    }

    await this.phoneInput.waitFor({state: 'visible',timeout: 10000});

    console.log('Login modal is visible.');

    await this.phoneInput.fill(phoneNumber);

    console.log('Phone number entered.');

    await this.getOtpButton.waitFor({state: 'visible',timeout: 5000});

    await this.getOtpButton.click();

    console.log('Get OTP clicked.');

    await this.firstOtpSlot.waitFor({state: 'visible',timeout: 5000});

    await this.firstOtpSlot.focus();

    console.log(
        '\n[AUTOMATION PAUSED] Enter the 6-digit OTP and click Resume.'
    );

    await this.page.pause();

    console.log('OTP entered. Looking for Login/Verify button...');

    await this.page.waitForTimeout(500);

    if (
        await this.loginButton.isVisible({
            timeout: 5000
        }).catch(() => false)
    ) {

        console.log('Login/Verify button found.');

        await this.loginButton.click({force: true});

        console.log('Login/Verify button clicked.');

    } else {

        console.log('Login/Verify button not found. Pressing Enter...');

        await this.page.keyboard.press('Enter');
    }

    await this.page.waitForTimeout(1500);

    await this.page.waitForLoadState('domcontentloaded').catch(() => null);

    console.log('Current URL after login:',this.page.url());

    console.log('Login process completed.');
}
}

module.exports = { LoginPage };
