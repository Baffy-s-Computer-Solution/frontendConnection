// frontend/src/test/e2e/home.spec.js
// ============================================================
// Playwright E2E for the Home landing page.
// ============================================================

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Home landing page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('renders hero and primary CTA', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/opportunity/i);
    await expect(page.getByRole('link', { name: /create free account/i })).toBeVisible();
  });

  test('navigates to register', async ({ page }) => {
    await page.getByRole('link', { name: /create free account/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('navigates to login', async ({ page }) => {
    await page.getByRole('link', { name: /^sign in$/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('trust bar shows partner names', async ({ page }) => {
    await expect(page.getByText('LNDC')).toBeVisible();
    await expect(page.getByText('BEDCO')).toBeVisible();
  });

  test('audience section renders four cards', async ({ page }) => {
    const section = page.locator('#platform');
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator('.audience-card')).toHaveCount(4);
  });

  test('FAQ accordion opens on click', async ({ page }) => {
    const faq = page.locator('#faq');
    await faq.scrollIntoViewIfNeeded();
    const second = faq.locator('details').nth(1);
    await second.locator('summary').click();
    await expect(second).toHaveAttribute('open', '');
  });

  test('community testimonials section renders', async ({ page }) => {
    const section = page.locator('#stories');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { name: /experiences from our community/i })).toBeVisible();
  });

  test('footer contains legal links', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });

  test('mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    await page.getByRole('button', { name: /open navigation/i }).click();
    await expect(page.locator('#landing-navigation')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#landing-navigation')).not.toHaveClass(/is-open/);
  });

  test('sticky mobile CTA appears after scroll', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(page.locator('.sticky-mobile-cta')).toBeVisible();
  });

  test('analytics events fire on CTA click', async ({ page }) => {
    const events = [];
    await page.exposeFunction('captureEvent', (detail) => events.push(detail));
    await page.evaluate(() => {
      window.addEventListener('cc:analytics', (e) => {
        // eslint-disable-next-line no-undef
        window.captureEvent(e.detail);
      });
    });
    await page.getByRole('link', { name: /create free account/i }).first().click();
    await page.waitForTimeout(200);
    expect(events.some((e) => e.event === 'cta_click')).toBeTruthy();
  });

  test('reduced motion disables animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE_URL);
    const orb = page.locator('.orb').first();
    const animation = await orb.evaluate((el) => getComputedStyle(el).animationDuration);
    expect(animation).toBe('0.01ms');
  });

  test('skip link is focusable and jumps to main', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /skip to main content/i });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});