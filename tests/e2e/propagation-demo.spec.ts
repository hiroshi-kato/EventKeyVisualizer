import { type Locator, type Page } from '@playwright/test';
import { test, expect, openApp, section, trackConsoleErrors } from './fixtures';

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
// Parent で Stop Propagation が有効なときの keydown / keyup 1回分のログ
const STOPPED_AT_PARENT: Row[] = [
  ['target', 'child'],
  ['bubble', 'parent', 'stopped'],
];
// Child で Prevent Default が有効なときの keydown / keyup 1回分のログ
const PREVENTED_AT_CHILD: Row[] = [
  ['target', 'child', 'prevented'],
  ['bubble', 'parent'],
  ['bubble', 'grandparent'],
];

// 同じ内容の行を count 回繰り返した、バッジの並び
const repeatRows = (rows: Row[], count: number): string[] =>
  Array.from({ length: count }, () => rows).flat(2);

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

// 3つの要素すべての Capture を有効にして、Child にフォーカスを戻す
async function enableCaptureEverywhere(page: Page): Promise<void> {
  for (const element of ['Grandparent', 'Parent', 'Child'] as const) {
    await toggle(page, element, 1).click();
  }
  await focusChild(page);
}

test('Child で押したキーが child → parent → grandparent へ伝播する', async ({ page }) => {
  await openApp(page);
  await focusChild(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText(repeatRows(PLAIN, 2));
});

test('Capture を有効にした要素は capture フェーズも記録する', async ({ page }) => {
  await openApp(page);
  await enableCaptureEverywhere(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText(repeatRows(CAPTURED, 2));
});

test('Stop Propagation を有効にした要素より外へは伝播しない', async ({ page }) => {
  await openApp(page);
  await toggle(page, 'Parent', 2).click();
  await focusChild(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText(repeatRows(STOPPED_AT_PARENT, 2));
});

test('Prevent Default を有効にした要素には prevented が付く', async ({ page }) => {
  await openApp(page);
  await toggle(page, 'Child', 3).click();
  await focusChild(page);
  await page.keyboard.press('a');

  await expect(badges(page)).toHaveText(repeatRows(PREVENTED_AT_CHILD, 2));
});

test('Clear Logs でログを消せる', async ({ page }) => {
  await openApp(page);
  await focusChild(page);
  await page.keyboard.press('a');
  await expect(badges(page)).toHaveCount(12);

  await demo(page).getByRole('button', { name: 'Clear Logs' }).click();
  await expect(demo(page)).toContainText('Click on Child to focus, then press any key');
});

test('ログを記録してもコンソールエラーが出ない', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await openApp(page);
  await focusChild(page);
  await page.keyboard.press('a');
  await expect(badges(page)).toHaveText(repeatRows(PLAIN, 2));
  await page.keyboard.press('b');
  await expect(badges(page)).toHaveText(repeatRows(PLAIN, 4));

  expect(errors).toEqual([]);
});

test('ログは最新の15件を表示する', async ({ page }) => {
  await openApp(page);
  await focusChild(page);
  // 1回押すごとに 6 件記録されるので、この時点で表示は 15 件でいっぱいになる
  for (let press = 0; press < 5; press++) {
    await page.keyboard.press('a');
  }
  await enableCaptureEverywhere(page);
  await page.keyboard.press('a');

  // 古い 4 回分は切り捨てられ、直前の keyup と最新の押下 (capture あり) が残る
  await expect(badges(page)).toHaveText([...PLAIN, ...CAPTURED, ...CAPTURED].flat());
});

test('押し続けてもログの行が重複したり欠けたりしない', async ({ page }) => {
  await openApp(page);
  await focusChild(page);
  for (let press = 0; press < 13; press++) {
    await page.keyboard.press('a');
  }

  await expect(badges(page)).toHaveText(repeatRows(PLAIN, 5));
});
