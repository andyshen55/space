import { test, expect } from "@playwright/test";

test.describe("Books Page - 3D Book Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001/books");
  });

  test("should display book carousel with books loaded", async ({ page }) => {
    const carousel = page.locator(".keen-slider");
    await expect(carousel).toBeVisible();

    const bookImages = page.locator(".keen-slider__slide img");
    const count = await bookImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should open book modal when clicking a book", async ({ page }) => {
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await firstBookButton.click();

    // Wait for modal to appear
    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    // Verify it appeared with close button
    const closeButton = page.getByRole("button", { name: /close/i }).last();
    await expect(closeButton).toBeVisible();
  });

  test("should close modal when clicking close button", async ({ page }) => {
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await firstBookButton.click();

    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    const closeButton = page.getByRole("button", { name: /close/i }).last();
    await closeButton.click();

    await page.waitForTimeout(300);

    // Carousel should be visible again
    const carousel = page.locator(".keen-slider");
    await expect(carousel).toBeVisible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("http://localhost:3001/books");

    const carousel = page.locator(".keen-slider");
    await expect(carousel).toBeVisible();

    // Click a book
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await firstBookButton.click();

    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    // Modal should be visible
    const closeButton = page.getByRole("button", { name: /close/i }).last();
    await expect(closeButton).toBeVisible();
  });
});
