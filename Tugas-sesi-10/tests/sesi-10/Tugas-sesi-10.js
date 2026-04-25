const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'https://www.saucedemo.com';
const VALID_PASSWORD = 'secret_sauce';

// ── Helper Functions ─────────────────────────────────────────────
async function fillLogin(driver, username, password) {
    if (username !== '') {
        await driver.findElement(By.id('user-name')).sendKeys(username);
    }
    if (password !== '') {
        await driver.findElement(By.id('password')).sendKeys(password);
    }
    await driver.findElement(By.id('login-button')).click();
}

async function getErrorMessage(driver) {
    const errorEl = await driver.wait(
        until.elementLocated(By.css('[data-test="error"]')),
        5000
    );
    return errorEl.getText();
}

// ── Test Suite ───────────────────────────────────────────────────
describe('SauceDemo - Login Page Test Scenarios', function () {
    let driver;

    // HOOK: buat browser baru sebelum setiap test
    beforeEach(async function () {
        const options = new chrome.Options();
        options.addArguments('--incognito');
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        // Buka halaman login sebelum setiap test
        await driver.get(BASE_URL);
    });

    // HOOK: tutup browser setelah setiap test
    afterEach(async function () {
        await driver.quit();
    });

    // ── TC-01: Login valid ───────────────────────────────────────
    it('TC-01: Login berhasil dengan kredensial valid', async function () {
        await fillLogin(driver, 'standard_user', VALID_PASSWORD);

        await driver.wait(
            until.elementLocated(By.css('[data-test="shopping-cart-link"]')),
            10000
        );

        const url = await driver.getCurrentUrl();
        assert.ok(url.includes('inventory'), `URL tidak sesuai: ${url}`);

        const logo = await driver.findElement(By.className('app_logo'));
        assert.strictEqual(await logo.getText(), 'Swag Labs');
    });

    // ── TC-02: Password salah ────────────────────────────────────
    it('TC-02: Login gagal dengan password salah', async function () {
        await fillLogin(driver, 'standard_user', 'wrong_password');

        const errorMsg = await getErrorMessage(driver);
        assert.ok(
            errorMsg.includes('Username and password do not match'),
            `Pesan error tidak sesuai: ${errorMsg}`
        );
    });

    // ── TC-03: Username kosong ───────────────────────────────────
    it('TC-03: Login gagal saat username kosong', async function () {
        await fillLogin(driver, '', VALID_PASSWORD);

        const errorMsg = await getErrorMessage(driver);
        assert.ok(
            errorMsg.includes('Username is required'),
            `Pesan error tidak sesuai: ${errorMsg}`
        );
    });

    // ── TC-04: Password kosong ───────────────────────────────────
    it('TC-04: Login gagal saat password kosong', async function () {
        await fillLogin(driver, 'standard_user', '');

        const errorMsg = await getErrorMessage(driver);
        assert.ok(
            errorMsg.includes('Password is required'),
            `Pesan error tidak sesuai: ${errorMsg}`
        );
    });

    // ── TC-05: Akun locked out ───────────────────────────────────
    it('TC-05: Login gagal dengan akun yang dikunci (locked_out_user)', async function () {
        await fillLogin(driver, 'locked_out_user', VALID_PASSWORD);

        const errorMsg = await getErrorMessage(driver);
        assert.ok(
            errorMsg.includes('Sorry, this user has been locked out'),
            `Pesan error tidak sesuai: ${errorMsg}`
        );
    });

    // ── TC-06: Username tidak terdaftar ─────────────────────────
    it('TC-06: Login gagal dengan username yang tidak terdaftar', async function () {
        await fillLogin(driver, 'user_tidak_ada', VALID_PASSWORD);

        const errorMsg = await getErrorMessage(driver);
        assert.ok(
            errorMsg.includes('Username and password do not match'),
            `Pesan error tidak sesuai: ${errorMsg}`
        );
    });

    // ── TC-07: Verifikasi elemen tombol Login ────────────────────
    it('TC-07: Tombol login tampil, aktif, dan bertuliskan Login', async function () {
        const loginBtn = await driver.findElement(By.id('login-button'));

        assert.ok(await loginBtn.isDisplayed(), 'Tombol login tidak tampil');
        assert.ok(await loginBtn.isEnabled(), 'Tombol login tidak aktif');

        const btnText = await loginBtn.getAttribute('value');
        assert.strictEqual(btnText, 'Login', `Teks tombol tidak sesuai: ${btnText}`);
    });

    // ── TC-08: Error bisa di-dismiss dengan klik tombol X ────────
    it('TC-08: Pesan error hilang setelah klik tombol X (dismiss)', async function () {
        // Munculkan error dulu
        await fillLogin(driver, '', '');
        await getErrorMessage(driver); 

        // Klik tombol X untuk dismiss
        const closeBtn = await driver.findElement(
            By.css('[data-test="error-button"]')
        );
        await closeBtn.click();

        // Verifikasi error sudah tidak tampil
        const errors = await driver.findElements(By.css('[data-test="error"]'));
        assert.strictEqual(errors.length, 0, 'Pesan error seharusnya sudah hilang setelah dismiss');
    });
});