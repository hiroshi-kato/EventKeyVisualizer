import { type Locator, type Page } from '@playwright/test';
import { test, expect, openApp, section } from './fixtures';

function practice(page: Page): Locator {
  return section(page, 'ショートカット練習場');
}

// 1番目が isComposing チェック、2番目が repeat チェック
const inputs = (page: Page) => practice(page).locator('input');
const logs = (page: Page) => practice(page).locator('.bg-slate-900');

const FIRED = 'Enter が発火しました！';
const BLOCKED = 'Enter がブロックされました (長押しリピート)';

for (const { platform, platformName, modKey, modKeyCode, otherModKey } of [
  { platform: 'windows' as const, platformName: 'Windows', modKey: 'Ctrl', modKeyCode: 'Control', otherModKey: 'Cmd' },
  { platform: 'mac' as const, platformName: 'macOS', modKey: 'Cmd', modKeyCode: 'Meta', otherModKey: 'Ctrl' },
]) {
  test.describe(platformName, () => {
    test.use({ platform });

    test(`${modKey}+S を押すとショートカットが発火してログに記録される`, async ({ page }) => {
      await openApp(page);
      await expect(logs(page).nth(0)).toContainText('ログがありません');

      await inputs(page).nth(0).focus();
      await page.keyboard.press(`${modKeyCode}+s`);
      await expect(logs(page).nth(0)).toContainText(`${modKey}+S が発火しました！`);
      await expect(logs(page).nth(0)).not.toContainText('ブロック');
      await expect(logs(page).nth(1)).toContainText('ログがありません');
    });

    test('MOD キーを押さずに S を押しても発火しない', async ({ page }) => {
      await openApp(page);

      await inputs(page).nth(0).focus();
      await page.keyboard.press('s');
      await expect(logs(page).nth(0)).toContainText('ログがありません');
    });

    test('コード例がプラットフォームの MOD キーで表示される', async ({ page }) => {
      await openApp(page);
      const snippets = section(page, 'ショートカット実装のベストプラクティス');

      await expect(snippets.locator('h4')).toHaveText([
        'MODキー判定ユーティリティ',
        'isComposingチェック',
        'repeatチェック',
        '完全な実装例',
      ]);
      await expect(snippets).toContainText(`保存ショートカット: ${modKey}+S`);
      await expect(snippets).toContainText(`コピー: ${modKey}+C`);
      await expect(snippets).not.toContainText(`${otherModKey}+S`);
    });
  });
}

test('Enter を長押しすると、repeat チェックが有効な間はブロックされる', async ({ page }) => {
  await openApp(page);
  await expect(logs(page).nth(1)).toContainText('ログがありません');

  await inputs(page).nth(1).focus();
  await page.keyboard.down('Enter');
  await expect(logs(page).nth(1).getByText(FIRED)).toHaveCount(1);
  await page.keyboard.down('Enter'); // 押したままにすると OS が同じキーを繰り返す
  await page.keyboard.down('Enter');
  await expect(logs(page).nth(1).getByText(BLOCKED)).toHaveCount(2);
  await expect(logs(page).nth(1).getByText(FIRED)).toHaveCount(1);
  await page.keyboard.up('Enter');

  // チェックを無効にすると repeat 中も発火する
  await practice(page).locator('[role="switch"]').nth(1).click();
  await inputs(page).nth(1).focus();
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await expect(logs(page).nth(1).getByText(FIRED)).toHaveCount(3);
  await expect(logs(page).nth(1).getByText(BLOCKED)).toHaveCount(2);
});

test('ログをクリアできる', async ({ page }) => {
  await openApp(page);
  await inputs(page).nth(0).focus();
  await page.keyboard.press('Control+s');
  await inputs(page).nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(logs(page).nth(0)).toContainText('Ctrl+S が発火しました！');
  await expect(logs(page).nth(1)).toContainText(FIRED);

  await practice(page).getByRole('button', { name: 'ログをクリア' }).click();
  await expect(practice(page).getByText('ログがありません')).toHaveCount(2);
});
