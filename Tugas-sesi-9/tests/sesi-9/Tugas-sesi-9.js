const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'https://www.saucedemo.com';
const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';

async function doLogin(driver) {
    await driver.get(BASE_URL);
    await driver.findElement(By.id('user-name')).sendKeys(USERNAME);
    await driver.findElement(By.id('password')).sendKeys(PASSWORD);
    await driver.findElement(By.id('login-button')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-test="shopping-cart-link"]')),
        10000
    );
}

async function sortProducts(driver, value) {
    const dropdown = await driver.findElement(
        By.css('[data-test="product-sort-container"]')
    );
    await dropdown.click();
    await driver.findElement(
        By.css(`[data-test="product-sort-container"] option[value="${value}"]`)
    ).click();
}

async function getProductNames(driver) {
    const items = await driver.findElements(
        By.css('[data-test="inventory-item-name"]')
    );
    return Promise.all(items.map(el => el.getText()));
}

describe('SauceDemo Test Suite', function () {
    let driver;

    beforeEach(async function () {
        const options = new chrome.Options();
        options.addArguments('--incognito');
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    afterEach(async function () {
        await driver.quit();
    });

    // ── TC-01: Sukses Login ──────────────────────────────────────
    it('TC-01: Sukses login dengan kredensial valid', async function () {
        await doLogin(driver);

        const url = await driver.getCurrentUrl();
        assert.ok(url.includes('inventory'), `URL tidak sesuai: ${url}`);

        const logo = await driver.findElement(By.className('app_logo'));
        assert.strictEqual(await logo.getText(), 'Swag Labs');
    });

    // ── TC-02: Urutkan Produk A-Z ────────────────────────────────
    it('TC-02: Produk dapat diurutkan dari A ke Z', async function () {
        await doLogin(driver);

        const namesDefault = await getProductNames(driver);

        // Precondition — sort ke Z-A dulu agar state berubah dari default nya yaitu sort A-Z
        await sortProducts(driver, 'za');
        const namesZA = await getProductNames(driver);

        // Verifikasi Z-A benar-benar berbeda dari default
        assert.notDeepStrictEqual(namesZA, namesDefault,
            'Sort Z-A seharusnya mengubah urutan dari default A-Z'
        );

        // Test sort A-Z
        await sortProducts(driver, 'az');
        const namesAZ = await getProductNames(driver);

        // Assert urutan sort A-Z benar
        const expected = [...namesAZ].sort();
        assert.deepStrictEqual(namesAZ, expected,
            `Produk tidak urut A-Z.\nAktual  : ${namesAZ}\nExpected: ${expected}`
        );

        // Assert A-Z sama seperti default
        assert.deepStrictEqual(namesAZ, namesDefault,
            'Urutan A-Z seharusnya sama dengan urutan default halaman'
        );
    });
});