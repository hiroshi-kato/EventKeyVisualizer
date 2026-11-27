import { type Locator, type Page } from '@playwright/test';
import { test, expect, openApp, section, holdKeys } from './fixtures';

type Shortcut = { keys: string[]; name: string; description: string };

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

// keys を押している間、組み合わせがそのまま表示され、ショートカット名が出る
async function expectDetected(page: Page, { keys, name, description }: Shortcut): Promise<void> {
  await holdKeys(page, keys, async () => {
    await expect(combination(page)).toHaveText(keys);
    await expect(detectedName(page)).toHaveText(name);
    await expect(detector(page).getByText(description, { exact: true })).toBeVisible();
  });
  await expect(detectedName(page)).toHaveCount(0);
}

// 修飾キーのないショートカットと、Shift + キーの組み合わせ
const SINGLE_KEYS: Shortcut[] = [
  { keys: ['Escape'], name: 'Escape', description: 'キャンセル/閉じる' },
  { keys: ['Enter'], name: 'Enter', description: '決定' },
  { keys: ['Space'], name: 'Space', description: 'スペース' },
  { keys: ['Shift', 'Tab'], name: 'Reverse Tab', description: '逆タブ移動' },
];

// Ctrl + 文字キーのショートカット
const CONTROL_SHORTCUTS: Shortcut[] = [
  { keys: ['Control', 's'], name: 'Save', description: '保存' },
  { keys: ['Control', 'c'], name: 'Copy', description: 'コピー' },
  { keys: ['Control', 'v'], name: 'Paste', description: 'ペースト' },
  { keys: ['Control', 'x'], name: 'Cut', description: '切り取り' },
  { keys: ['Control', 'z'], name: 'Undo', description: '元に戻す' },
  { keys: ['Control', 'y'], name: 'Redo', description: 'やり直し' },
  { keys: ['Control', 'a'], name: 'Select All', description: '全選択' },
  { keys: ['Control', 'f'], name: 'Find', description: '検索' },
];

// Cmd (Meta) + 文字キーのショートカット
const META_SHORTCUTS: Shortcut[] = [
  { keys: ['Meta', 's'], name: 'Save (Mac)', description: '保存 (Mac)' },
  { keys: ['Meta', 'c'], name: 'Copy (Mac)', description: 'コピー (Mac)' },
  { keys: ['Meta', 'v'], name: 'Paste (Mac)', description: 'ペースト (Mac)' },
  { keys: ['Meta', 'x'], name: 'Cut (Mac)', description: '切り取り (Mac)' },
  { keys: ['Meta', 'z'], name: 'Undo (Mac)', description: '元に戻す (Mac)' },
  { keys: ['Meta', 'a'], name: 'Select All (Mac)', description: '全選択 (Mac)' },
];

function registerDetectionTests(shortcuts: Shortcut[]): void {
  for (const shortcut of shortcuts) {
    test(`${shortcut.keys.join('+')} を ${shortcut.name} として検出できる`, async ({ page }) => {
      await openApp(page);
      await expectDetected(page, shortcut);
    });
  }
}

test.describe('Windows', () => {
  registerDetectionTests([...SINGLE_KEYS, ...CONTROL_SHORTCUTS]);

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

  registerDetectionTests(META_SHORTCUTS);

  test('プラットフォームと MOD キーを表示する', async ({ page }) => {
    await openApp(page);
    await expect(detector(page).getByText('macOS', { exact: true })).toBeVisible();
    await expect(detector(page).getByText('Cmd', { exact: true })).toBeVisible();
  });
});
