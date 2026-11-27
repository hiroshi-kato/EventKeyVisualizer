import { type Locator, type Page } from '@playwright/test';
import { test, expect, openApp, section, holdKeys } from './fixtures';

// 仮想キーボードのキーには title="ラベル (code)" が付いている
function key(page: Page, title: string): Locator {
  return section(page, 'Virtual Keyboard').getByTitle(title);
}

test('押したキーの key と code を表示し、仮想キーボードの同じキーをハイライトする', async ({ page }) => {
  await openApp(page);
  const keyDisplay = section(page, 'Key Display');
  const keyA = key(page, 'A (KeyA)');

  await expect(keyDisplay.getByText('-', { exact: true })).toHaveCount(2);
  await expect(keyA).not.toHaveClass(/bg-primary/);

  await page.keyboard.down('a');
  await expect(keyDisplay.getByText('a', { exact: true })).toBeVisible();
  await expect(keyDisplay.getByText('KeyA', { exact: true })).toBeVisible();
  await expect(keyA).toHaveClass(/bg-primary/);

  await page.keyboard.up('a');
  await expect(keyA).not.toHaveClass(/bg-primary/);
});

test('修飾キーを押すとバッジと対応するキーが有効になり、離すと戻る', async ({ page }) => {
  await openApp(page);
  // 下段に並ぶ修飾キーのバッジ (Ctrl, Shift, Alt, Meta)
  const badges = section(page, 'Key Display')
    .locator('[data-slot="card-content"] > div')
    .last()
    .locator('[data-slot="badge"]');
  const leftShift = key(page, 'Shift (ShiftLeft)');

  await expect(badges).toHaveText(['Ctrl', 'Shift', 'Alt', 'Meta']);
  const shiftBadge = badges.nth(1);
  await expect(shiftBadge).toHaveAttribute('data-variant', 'outline');
  await expect(leftShift).not.toHaveClass(/bg-primary/);

  await page.keyboard.down('ShiftLeft');
  await expect(shiftBadge).toHaveAttribute('data-variant', 'default');
  await expect(leftShift).toHaveClass(/bg-primary/);

  await page.keyboard.up('ShiftLeft');
  await expect(shiftBadge).toHaveAttribute('data-variant', 'outline');
  await expect(leftShift).not.toHaveClass(/bg-primary/);
});

test('Shift を押しながら押すと大文字の key になる', async ({ page }) => {
  await openApp(page);
  const keyDisplay = section(page, 'Key Display');

  await holdKeys(page, ['Shift', 'KeyA'], async () => {
    await expect(keyDisplay.getByText('A', { exact: true })).toBeVisible();
    await expect(keyDisplay.getByText('KeyA', { exact: true })).toBeVisible();
    await expect(keyDisplay.getByText('Shift + A', { exact: true })).toBeVisible();
  });
});
