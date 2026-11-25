import { type Page } from '@playwright/test';
import { test, expect, openApp, section } from './fixtures';

// 仮想キーボードのキーには title="ラベル (code)" が付いている
function metaKey(page: Page, code: 'MetaLeft' | 'MetaRight') {
  return section(page, 'Virtual Keyboard').locator(`[title$="(${code})"]`);
}

// Meta キーの刻印は OS で異なる
for (const { platform, platformName, label } of [
  { platform: 'windows' as const, platformName: 'Windows', label: 'Win' },
  { platform: 'mac' as const, platformName: 'macOS', label: '⌘' },
]) {
  test.describe(platformName, () => {
    test.use({ platform });

    test(`Meta キーは ${label} と表示される`, async ({ page }) => {
      await openApp(page);

      await expect(metaKey(page, 'MetaLeft')).toHaveText(label);
      await expect(metaKey(page, 'MetaRight')).toHaveText(label);
      await expect(metaKey(page, 'MetaLeft')).toHaveAttribute('title', `${label} (MetaLeft)`);
    });

    test('Meta キーを押すと左右の Meta キーがハイライトされる', async ({ page }) => {
      await openApp(page);
      const left = metaKey(page, 'MetaLeft');
      const right = metaKey(page, 'MetaRight');
      await expect(left).not.toHaveClass(/bg-primary/);

      await page.keyboard.down('Meta');
      await expect(left).toHaveClass(/bg-primary/);
      await expect(right).toHaveClass(/bg-primary/);

      await page.keyboard.up('Meta');
      await expect(left).not.toHaveClass(/bg-primary/);
    });
  });
}
