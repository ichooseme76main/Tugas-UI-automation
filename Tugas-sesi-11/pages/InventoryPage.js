const { By, until } = require('selenium-webdriver');

/**
 * Page Object Model — Inventory / Products Page
 */
class InventoryPage {
    constructor(driver) {
        this.driver = driver;

        // ── Locators ──────────────────────────────────────────────
        this.cartLink     = By.css('[data-test="shopping-cart-link"]');
        this.sortDropdown = By.css('[data-test="product-sort-container"]');
        this.productNames = By.css('[data-test="inventory-item-name"]');
    }

    async waitUntilLoaded() {
        await this.driver.wait(
            until.elementLocated(this.cartLink),
            10000
        );
    }

    async sortBy(value) {
        const dropdown = await this.driver.findElement(this.sortDropdown);
        await dropdown.click();
        const option = await this.driver.findElement(
            By.css(`[data-test="product-sort-container"] option[value="${value}"]`)
        );
        await option.click();
    }

    async getProductNames() {
        const elements = await this.driver.findElements(this.productNames);
        return Promise.all(elements.map(el => el.getText()));
    }
}

module.exports = InventoryPage;
