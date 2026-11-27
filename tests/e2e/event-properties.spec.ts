import { type Locator, type Page } from '@playwright/test';
import { test, expect, openApp, section } from './fixtures';

// Event Properties の各項目 (repeat, location, ...) の値
function property(page: Page, label: string): Locator {
  return section(page, 'Event Properties')
    .getByText(label, { exact: true })
    .locator('..')
    .locator('[data-slot="badge"]');
}

// 矢印キーは keypress を発生させないので、最後のイベントが keydown のまま残る
test('押したキーのプロパティを表示する', async ({ page }) => {
  await openApp(page);
  await expect(section(page, 'Event Properties')).toContainText('Press any key to see properties');

  await page.keyboard.down('ArrowDown');
  await expect(property(page, 'type')).toHaveText('keydown');
  await expect(property(page, 'repeat')).toHaveText('false');
  await expect(property(page, 'location')).toHaveText('0 (Standard)');
  await expect(property(page, 'isComposing')).toHaveText('false');
  await expect(property(page, 'bubbles')).toHaveText('true');
  await expect(property(page, 'cancelable')).toHaveText('true');
  await expect(property(page, 'timeStamp')).toHaveText(/^\d+\.\d{2}ms$/);

  await page.keyboard.up('ArrowDown');
  await expect(property(page, 'type')).toHaveText('keyup');
});

test('文字キーは keydown の直後に keypress が発生する', async ({ page }) => {
  await openApp(page);

  await page.keyboard.down('a');
  await expect(property(page, 'type')).toHaveText('keypress');
});

test('長押しすると repeat が true になる', async ({ page }) => {
  await openApp(page);

  await page.keyboard.down('ArrowDown');
  await expect(property(page, 'repeat')).toHaveText('false');
  await page.keyboard.down('ArrowDown'); // 押したままにすると OS が同じキーを繰り返す
  await expect(property(page, 'repeat')).toHaveText('true');

  await page.keyboard.up('ArrowDown');
  await expect(property(page, 'repeat')).toHaveText('false');
});

test('左右のキーとテンキーは location で区別される', async ({ page }) => {
  await openApp(page);

  await page.keyboard.down('ShiftLeft');
  await expect(property(page, 'location')).toHaveText('1 (Left)');
  await page.keyboard.up('ShiftLeft');

  await page.keyboard.down('ShiftRight');
  await expect(property(page, 'location')).toHaveText('2 (Right)');
  await page.keyboard.up('ShiftRight');

  await page.keyboard.down('Numpad1');
  await expect(property(page, 'location')).toHaveText('3 (Numpad)');
  await page.keyboard.up('Numpad1');
});
