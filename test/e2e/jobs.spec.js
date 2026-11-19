// frontend/src/test/e2e/jobs.spec.js
// ============================================================
// E2E Tests: Job Search Flows
// ============================================================
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Job Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('should browse jobs', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);
    await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible();
  });

  test('should search jobs', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);
    await page.fill('input[placeholder*="Search jobs"]', 'developer');
    await page.waitForTimeout(500);

    const cards = page.locator('[data-testid="job-card"]');
    await expect(cards.first()).toContainText(/developer/i);
  });

  test('should filter jobs by location', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);
    await page.selectOption('select[name="location"]', 'Remote');
    await page.waitForTimeout(500);

    const cards = page.locator('[data-testid="job-card"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText(/remote/i);
    }
  });

  test('should view job details', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);
    await page.locator('[data-testid="job-card"]').first().click();

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Job Description')).toBeVisible();
    await expect(page.locator('text=Requirements')).toBeVisible();
  });

  test('should apply for a job', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);
    await page.locator('[data-testid="job-card"]').first().click();
    await page.click('button:has-text("Apply")');

    await page.fill('textarea[name="coverLetter"]', 'I am very interested.');
    await page.click('button:has-text("Submit Application")');

    await expect(page.locator('text=Application submitted')).toBeVisible();
  });

  test('should paginate through jobs', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);

    const firstJobTitle = await page
      .locator('[data-testid="job-card"]')
      .first()
      .textContent();

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    const newFirstJobTitle = await page
      .locator('[data-testid="job-card"]')
      .first()
      .textContent();

    expect(newFirstJobTitle).not.toBe(firstJobTitle);
  });

  test('should save job to favorites', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);

    const saveButton = page.locator('[data-testid="save-job"]').first();
    await saveButton.click();

    await expect(saveButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should navigate to saved jobs', async ({ page }) => {
    await page.goto(`${BASE_URL}/student/jobs`);
    await page.click('[data-testid="save-job"]');
    await page.click('a:has-text("Saved Jobs")');

    await expect(page).toHaveURL(/saved/);
    await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible();
  });
});