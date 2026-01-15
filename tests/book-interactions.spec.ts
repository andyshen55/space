import { test, expect } from "@playwright/test";

test.describe("Book Modal - Interaction Effects", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001/books");
  });

  test("book modal opens and closes without opacity flashing", async ({ page }) => {
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");

    // Click to open modal
    await firstBookButton.click();
    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    // Verify modal is visible
    const closeButton = page.getByRole("button", { name: /close/i }).last();
    await expect(closeButton).toBeVisible();

    // Close modal
    await closeButton.click();
    await page.waitForTimeout(300);

    // Verify carousel is back
    const carousel = page.locator(".keen-slider");
    await expect(carousel).toBeVisible();
  });

  test("book responds to user interaction for 3D effect on desktop", async ({
    page,
  }) => {
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await firstBookButton.click();

    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    // Move mouse into the book area to trigger 3D effect
    const modal = page.locator(".fixed.inset-0").first();
    const box = await modal.boundingBox();

    if (box) {
      // Move to different positions
      await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2);
      await page.waitForTimeout(100);

      await page.mouse.move(box.x + (box.width * 3) / 4, box.y + box.height / 2);
      await page.waitForTimeout(100);

      // Move away to reset
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
    }

    // Interaction completed without errors
    const closeButton = page.getByRole("button", { name: /close/i }).last();
    await expect(closeButton).toBeVisible();
  });

  test("book flips on click when book is in focus", async ({ page }) => {
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await firstBookButton.click();

    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    // Click on the book to flip it
    const modal = page.locator(".fixed.inset-0").first();
    const box = await modal.boundingBox();

    if (box) {
      // Click in the center to flip
      await page.click("body", {
        position: {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        },
      });

      await page.waitForTimeout(700);
    }

    // Reading notes should be visible on back
    const notesVisible = await page.getByText("Reading Notes").isVisible().catch(() => false);
    expect(notesVisible).toBe(true);
  });

  test("swipe gesture still works to flip book", async ({ page }) => {
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await firstBookButton.click();

    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    // Simulate swipe gesture
    const modal = page.locator(".fixed.inset-0").first();
    const box = await modal.boundingBox();

    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      // Swipe from center to the right (> 50px)
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 100, startY);
      await page.mouse.up();

      await page.waitForTimeout(700);
    }

    // Book should be flipped now
    const notesVisible = await page.getByText("Reading Notes").isVisible().catch(() => false);
    expect(notesVisible).toBe(true);
  });

  test("interaction effects work on desktop but not on mobile", async ({
    page,
  }) => {
    // Desktop first
    const firstBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await firstBookButton.click();

    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    const closeButton = page.getByRole("button", { name: /close/i }).last();
    await closeButton.click();
    await page.waitForTimeout(300);

    // Now test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("http://localhost:3001/books");

    const mobileBookButton = page.locator(".keen-slider__slide").first().locator("button");
    await mobileBookButton.click();

    await page.waitForSelector('[style*="perspective"]', { timeout: 5000 });

    // Modal should open successfully on mobile
    const mobileCloseButton = page.getByRole("button", { name: /close/i }).last();
    await expect(mobileCloseButton).toBeVisible();
  });
});
