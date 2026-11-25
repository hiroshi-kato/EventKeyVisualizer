import { type Locator, type Page } from '@playwright/test';
import { test, expect, openApp, section, holdKeys } from './fixtures';

function detector(page: Page): Locator {
  return section(page, 'Shortcut Detector');
}

// Current combination: に並ぶキー名
function combination(page: Page): Locator {
  return detector(page)
    .locator('p', { hasText: 'Current combination:' })
    .locator('..')
    .locator('[data-slot="badge"]');
}

// 検出されたショートカット名 (見つからないときは要素がない)
function detectedName(page: Page): Locator {
  return detector(page).locator('p.font-medium');
}

test.describe('Windows', () => {
  test('プラットフォームと MOD キーを表示する', async ({ page }) => {
    await openApp(page);
    await expect(detector(page).getByText('Windows', { exact: true })).toBeVisible();
    await expect(detector(page).getByText('Ctrl', { exact: true })).toBeVisible();
  });

  test('押しているキーの組み合わせを表示する', async ({ page }) => {
    await openApp(page);
    await expect(combination(page)).toHaveText([]);
    await expect(detector(page)).toContainText('No keys pressed');

    await holdKeys(page, ['Control', 'Shift'], async () => {
      await expect(combination(page)).toHaveText(['Control', 'Shift']);
      await expect(detector(page)).not.toContainText('No keys pressed');
    });

    await expect(combination(page)).toHaveText([]);
    await expect(detector(page)).toContainText('No keys pressed');
  });

  for (const { keys, name, description } of [
    { keys: ['Escape'], name: 'Escape', description: 'キャンセル/閉じる' },
    { keys: ['Enter'], name: 'Enter', description: '決定' },
    { keys: ['Space'], name: 'Space', description: 'スペース' },
    { keys: ['Shift', 'Tab'], name: 'Reverse Tab', description: '逆タブ移動' },
  ]) {
    test(`${keys.join('+')} を ${name} として検出できる`, async ({ page }) => {
      await openApp(page);

      await holdKeys(page, keys, async () => {
        await expect(combination(page)).toHaveText(keys);
        await expect(detectedName(page)).toHaveText(name);
        await expect(detector(page).getByText(description, { exact: true })).toBeVisible();
      });

      await expect(detectedName(page)).toHaveCount(0);
    });
  }

  test('長押し中はショートカットが無効と表示される', async ({ page }) => {
    await openApp(page);

    await page.keyboard.down('a');
    await expect(detector(page)).toContainText('Status: 有効');
    await page.keyboard.down('a'); // 押したままにすると OS が同じキーを繰り返す
    await expect(detector(page)).toContainText('repeat: true');
    await expect(detector(page)).toContainText('Status: 無効');

    await page.keyboard.up('a');
  });
});

test.describe('macOS', () => {
  test.use({ platform: 'mac' });

  test('プラットフォームと MOD キーを表示する', async ({ page }) => {
    await openApp(page);
    await expect(detector(page).getByText('macOS', { exact: true })).toBeVisible();
    await expect(detector(page).getByText('Cmd', { exact: true })).toBeVisible();
  });
});
