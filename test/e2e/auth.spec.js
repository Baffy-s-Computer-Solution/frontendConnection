// frontend/src/test/e2e/auth.spec.js
// ============================================================
// E2E Tests: Authentication Flows
// ============================================================
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should display login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('h1')).toContainText(/sign in/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should login successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText(
      /invalid credentials/i
    );
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', `john${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="role"]', 'student');
    await page.check('input[name="terms"]');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/verify-email|dashboard/);
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('text=Forgot password');

    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    await expect(page).toHaveURL(/login|home/);
  });

  test('should persist session on reload', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    await page.reload();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should protect private routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/login/);
  });
});