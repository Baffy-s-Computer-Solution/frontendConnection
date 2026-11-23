// frontend/src/test/e2e/profile.spec.js
// ============================================================
// E2E Tests: Profile Management
// ============================================================
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Profile Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    await page.goto(`${BASE_URL}/student/profile`);
  });

  test('should display profile information', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/profile/i);
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
  });

  test('should edit profile', async ({ page }) => {
    await page.fill('input[name="firstName"]', 'Jane');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Profile updated')).toBeVisible();
    await page.reload();
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Jane');
  });

  test('should upload profile photo', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    await expect(page.locator('text=Photo updated')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should add skills', async ({ page }) => {
    await page.click('button:has-text("Add Skill")');
    await page.fill('input[name="skill"]', 'Python');
    await page.click('button:has-text("Add")');

    await expect(page.locator('text=Python')).toBeVisible();
  });

  test('should remove skills', async ({ page }) => {
    await page.click('button:has-text("Add Skill")');
    await page.fill('input[name="skill"]', 'TemporarySkill');
    await page.click('button:has-text("Add")');

    await page.click('[data-testid="remove-skill-TemporarySkill"]');
    await expect(page.locator('text=TemporarySkill')).not.toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await page.click('a:has-text("Security")');
    await page.fill('input[name="currentPassword"]', 'password123');
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
    await page.click('button:has-text("Update Password")');

    await expect(page.locator('text=Password updated')).toBeVisible();
  });
});