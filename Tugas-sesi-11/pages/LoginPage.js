const { By, until } = require('selenium-webdriver');

/**
 * Page Object Model — Login Page
 * Semua locator dan action halaman login dikumpulkan di sini.
 */
class LoginPage {
    constructor(driver) {
        this.driver = driver;
        this.url = 'https://www.saucedemo.com';

        // ── Locators ──────────────────────────────────────────────
        this.usernameInput = By.id('user-name');
        this.passwordInput = By.id('password');
        this.loginButton   = By.id('login-button');
        this.errorMessage  = By.css('[data-test="error"]');
        this.errorCloseBtn = By.css('[data-test="error-button"]');
        this.appLogo       = By.className('app_logo');
        this.cartLink      = By.css('[data-test="shopping-cart-link"]');
    }

    // ── Actions ───────────────────────────────────────────────────

    async open() {
        await this.driver.get(this.url);
    }

    async login(username, password) {
        if (username) {
            const el = await this.driver.findElement(this.usernameInput);
            await el.clear();
            await el.sendKeys(username);
        }
        if (password) {
            const el = await this.driver.findElement(this.passwordInput);
            await el.clear();
            await el.sendKeys(password);
        }
        await this.driver.findElement(this.loginButton).click();
    }

    async dismissError() {
        await this.driver.findElement(this.errorCloseBtn).click();
    }

    async waitForInventoryPage() {
        await this.driver.wait(
            until.elementLocated(this.cartLink),
            10000
        );
    }

    // ── Getters ───────────────────────────────────────────────────

    async getErrorMessage() {
        const el = await this.driver.wait(
            until.elementLocated(this.errorMessage),
            5000
        );
        return el.getText();
    }

    async isErrorDisplayed() {
        try {
            const el = await this.driver.findElement(this.errorMessage);
            return el.isDisplayed();
        } catch {
            return false;
        }
    }

    async getCurrentUrl() {
        return this.driver.getCurrentUrl();
    }

    async getLogoText() {
        const el = await this.driver.findElement(this.appLogo);
        return el.getText();
    }

    async getLoginButton() {
        return this.driver.findElement(this.loginButton);
    }
}

module.exports = LoginPage;
