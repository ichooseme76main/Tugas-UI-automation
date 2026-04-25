const { Builder, By, until } = require('selenium-webdriver');
const assert        = require('assert');
const chrome        = require('selenium-webdriver/chrome');
const LoginPage     = require('../../pages/LoginPage');
const InventoryPage = require('../../pages/InventoryPage');
const { visualCheck } = require('../../helper/visualRegression');

const VALID_PASSWORD = 'secret_sauce';

// ── Setup Driver ─────────────────────────────────────────────────
async function buildDriver() {
    const options = new chrome.Options();
    options.addArguments('--incognito');
    options.addArguments('--window-size=1440,900');
    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
}

// ════════════════════════════════════════════════════════════════
// Test SUITE 1 — Login Page
// ════════════════════════════════════════════════════════════════
describe('SauceDemo - Login Page Test Scenarios', function () {
    let driver;
    let loginPage;

    beforeEach(async function () {
        driver    = await buildDriver();
        loginPage = new LoginPage(driver);
        await loginPage.open();
    });

    afterEach(async function () {
        await driver.quit();
    });

    // ── POSITIVE CASE ────────────────────────────────────────────

    it('TC-01: Login berhasil dengan kredensial valid', async function () {
        await loginPage.login('standard_user', VALID_PASSWORD);
        await loginPage.waitForInventoryPage();

        await visualCheck(driver, 'tc01_login_sukses');

        const url = await loginPage.getCurrentUrl();
        assert.ok(url.includes('inventory'), `URL tidak sesuai: ${url}`);

        const logo = await loginPage.getLogoText();
        assert.strictEqual(logo, 'Swag Labs', `Logo teks tidak sesuai: ${logo}`);
    });

    it('TC-07: Tombol login tampil, aktif, dan bertuliskan Login', async function () {
        await visualCheck(driver, 'tc07_halaman_login_awal');

        const loginBtn = await loginPage.getLoginButton();
        assert.ok(await loginBtn.isDisplayed(), 'Tombol login tidak tampil');
        assert.ok(await loginBtn.isEnabled(),   'Tombol login tidak aktif');

        const btnText = await loginBtn.getAttribute('value');
        assert.strictEqual(btnText, 'Login', `Teks tombol tidak sesuai: ${btnText}`);
    });

    // ── NEGATIVE CASE ────────────────────────────────────────────

    it('TC-02: Login gagal dengan password salah', async function () {
        await loginPage.login('standard_user', 'wrong_password');

        await visualCheck(driver, 'tc02_error_password_salah');

        const errMsg = await loginPage.getErrorMessage();
        assert.ok(
            errMsg.includes('Username and password do not match'),
            `Pesan error tidak sesuai: ${errMsg}`
        );
    });

    it('TC-03: Login gagal saat username kosong', async function () {
        await loginPage.login(null, VALID_PASSWORD);

        await visualCheck(driver, 'tc03_error_username_kosong');

        const errMsg = await loginPage.getErrorMessage();
        assert.ok(
            errMsg.includes('Username is required'),
            `Pesan error tidak sesuai: ${errMsg}`
        );
    });

    it('TC-04: Login gagal saat password kosong', async function () {
        await loginPage.login('standard_user', null);

        await visualCheck(driver, 'tc04_error_password_kosong');

        const errMsg = await loginPage.getErrorMessage();
        assert.ok(
            errMsg.includes('Password is required'),
            `Pesan error tidak sesuai: ${errMsg}`
        );
    });

    it('TC-05: Login gagal dengan akun yang dikunci (locked_out_user)', async function () {
        await loginPage.login('locked_out_user', VALID_PASSWORD);

        await visualCheck(driver, 'tc05_error_locked_out');

        const errMsg = await loginPage.getErrorMessage();
        assert.ok(
            errMsg.includes('Sorry, this user has been locked out'),
            `Pesan error tidak sesuai: ${errMsg}`
        );
    });

    it('TC-06: Login gagal dengan username yang tidak terdaftar', async function () {
        await loginPage.login('user_tidak_ada', VALID_PASSWORD);

        await visualCheck(driver, 'tc06_error_invalid_user');

        const errMsg = await loginPage.getErrorMessage();
        assert.ok(
            errMsg.includes('Username and password do not match'),
            `Pesan error tidak sesuai: ${errMsg}`
        );
    });

    it('TC-08: Pesan error hilang setelah klik tombol X (dismiss)', async function () {
        await loginPage.login(null, null);
        await loginPage.getErrorMessage();

        await visualCheck(driver, 'tc08_sebelum_dismiss');

        await loginPage.dismissError();

        await visualCheck(driver, 'tc08_setelah_dismiss');

        const isError = await loginPage.isErrorDisplayed();
        assert.strictEqual(isError, false,
            'Pesan error seharusnya sudah hilang setelah dismiss');
    });
});
