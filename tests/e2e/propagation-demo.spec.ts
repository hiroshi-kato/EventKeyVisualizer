import { type Locator, type Page } from '@playwright/test';
import { test, expect, openApp, section } from './fixtures';

// ログの1行は「フェーズ」「要素」(+ stopped / prevented) のバッジでできている
type Row = [phase: string, element: string, ...flags: string[]];

// Capture が無効なときの keydown / keyup 1回分のログ
const PLAIN: Row[] = [
  ['target', 'child'],
  ['bubble', 'parent'],
  ['bubble', 'grandparent'],
];
// 3つの要素すべてで Capture が有効なときの keydown / keyup 1回分のログ
const CAPTURED: Row[] = [
  ['capture', 'grandparent'],
  ['capture', 'parent'],
  ['capture', 'child'],
  ['target', 'child'],
  ['bubble', 'parent'],
  ['bubble', 'grandparent'],
];

function demo(page: Page): Locator {
  return section(page, 'Event Propagation Demo');
}

// ログに並ぶバッジを上から順に返す
function badges(page: Page): Locator {
  return demo(page).locator('.space-y-1 [data-slot="badge"]');
}

// 操作テーブルの Element 行の右にあるスイッチを返す (1: Capture, 2: Stop Prop., 3: Prevent Def.)
function toggle(page: Page, element: 'Grandparent' | 'Parent' | 'Child', column: number): Locator {
  return demo(page)
    .locator('.grid > div', { hasText: new RegExp(`^${element}$`) })
    .locator(`xpath=following-sibling::*[${column}]`);
}

// スイッチを操作するとフォーカスが外れるので、キーを送る前に Child に戻す
async function focusChild(page: Page): Promise<void> {
  await demo(page).getByRole('button', { name: 'Focus Child' }).click();
}

test('Child で押したキーが child → parent → grandparent へ伝播する', async ({ page }) => {
  await openApp(page);
  await focusChild(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText([...PLAIN, ...PLAIN].flat());
});

test('Capture を有効にした要素は capture フェーズも記録する', async ({ page }) => {
  await openApp(page);
  for (const element of ['Grandparent', 'Parent', 'Child'] as const) {
    await toggle(page, element, 1).click();
  }
  await focusChild(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText([...CAPTURED, ...CAPTURED].flat());
});

test('Stop Propagation を有効にした要素より外へは伝播しない', async ({ page }) => {
  await openApp(page);
  await toggle(page, 'Parent', 2).click();
  await focusChild(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText(
    [
      ['target', 'child'],
      ['bubble', 'parent', 'stopped'],
      ['target', 'child'],
      ['bubble', 'parent', 'stopped'],
    ].flat()
  );
});

test('Prevent Default を有効にした要素には prevented が付く', async ({ page }) => {
  await openApp(page);
  await toggle(page, 'Child', 3).click();
  await focusChild(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText(
    [
      ['target', 'child', 'prevented'],
      ['bubble', 'parent'],
      ['bubble', 'grandparent'],
      ['target', 'child', 'prevented'],
      ['bubble', 'parent'],
      ['bubble', 'grandparent'],
    ].flat()
  );
});

test('Clear Logs でログを消せる', async ({ page }) => {
  await openApp(page);
  await focusChild(page);
  await page.keyboard.press('a');
  await expect(badges(page)).toHaveCount(12);

  await demo(page).getByRole('button', { name: 'Clear Logs' }).click();
  await expect(demo(page)).toContainText('Click on Child to focus, then press any key');
});
