const fs   = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const BASELINE_DIR = path.join(__dirname, '../screenshots/baseline');
const ACTUAL_DIR   = path.join(__dirname, '../screenshots/actual');
const DIFF_DIR     = path.join(__dirname, '../screenshots/diff');

[BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Ambil screenshot dan bandingkan dengan baseline.
 *
 * - First run  → screenshot disimpan sebagai baseline (test tetap pass).
 * - Run berikutnya → dibandingkan piksel per piksel dengan baseline.
 *   Jika ada perbedaan → diff image disimpan di screenshots/diff/.
 *
 * @param {WebDriver} driver
 * @param {string}    testName  - nama unik, e.g. 'tc01_login_sukses'
 * @param {number}    threshold - toleransi (0.0–1.0), default 0.1
 * @returns {{ match: boolean, diffPixels: number }}
 */
async function visualCheck(driver, testName, threshold = 0.1) {
    const filename     = `${testName}.png`;
    const actualPath   = path.join(ACTUAL_DIR,   filename);
    const baselinePath = path.join(BASELINE_DIR, filename);
    const diffPath     = path.join(DIFF_DIR,     filename);

    // Simpan screenshot aktual
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(actualPath, Buffer.from(screenshot, 'base64'));

    // Belum ada baseline → jadikan baseline, langsung pass
    if (!fs.existsSync(baselinePath)) {
        fs.copyFileSync(actualPath, baselinePath);
        console.log(`  [Visual] Baseline dibuat: ${filename}`);
        return { match: true, diffPixels: 0, isFirstRun: true };
    }

    // Bandingkan dengan baseline
    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    const actualImg   = PNG.sync.read(fs.readFileSync(actualPath));
    const { width, height } = baselineImg;
    const diffImg = new PNG({ width, height });

    const diffPixels = pixelmatch(
        baselineImg.data, actualImg.data, diffImg.data,
        width, height, { threshold }
    );

    fs.writeFileSync(diffPath, PNG.sync.write(diffImg));

    const match = diffPixels === 0;
    if (!match) {
        console.log(`  [Visual] DIFF: ${diffPixels} piksel berbeda → screenshots/diff/${filename}`);
    } else {
        console.log(`  [Visual] OK — tidak ada perbedaan visual`);
    }

    return { match, diffPixels };
}

module.exports = { visualCheck };
