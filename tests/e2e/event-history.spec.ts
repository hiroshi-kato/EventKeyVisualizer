import { test, expect, openApp, section } from './fixtures';

const EMPTY = {
  history: 'No key events recorded',
  eventTimeline: 'Press any key to see timeline',
  pressTimeline: 'Press and hold any key to see press durations',
};

test('Key History に keydown が新しい順に記録される', async ({ page }) => {
  await openApp(page);
  const history = section(page, 'Key History');
  await expect(history).toContainText(EMPTY.history);

  for (const key of ['a', 'b', 'c']) {
    await page.keyboard.press(key);
  }

  await expect(history.locator('[data-slot="card-title"]')).toHaveText('Key History(3)');
  const rows = history.locator('.space-y-2 > div');
  await expect(rows).toHaveCount(3);
  for (const [index, key] of ['c', 'b', 'a'].entries()) {
    await expect(rows.nth(index).locator('[data-slot="badge"]')).toHaveText([key, 'keydown']);
    await expect(rows.nth(index)).toContainText(`Key${key.toUpperCase()}`);
  }
});

test('Event Type Timeline に keydown・keypress・keyup が新しい順で記録される', async ({ page }) => {
  await openApp(page);
  const timeline = section(page, 'Event Type Timeline');
  await expect(timeline).toContainText(EMPTY.eventTimeline);

  await page.keyboard.press('a');

  await expect(timeline.locator('[data-slot="card-title"]')).toContainText('(3 events)');
  const rows = timeline.locator('.max-h-40 > div');
  await expect(rows).toHaveCount(3);
  for (const [index, type] of ['keyup', 'keypress', 'keydown'].entries()) {
    await expect(rows.nth(index).locator('[data-slot="badge"]')).toHaveText(type);
    await expect(rows.nth(index)).toContainText('(KeyA)');
  }
});

test('Key Press Timeline に押した順序と押下時間が表示される', async ({ page }) => {
  await openApp(page);
  const timeline = section(page, 'Key Press Timeline');
  await expect(timeline).toContainText(EMPTY.pressTimeline);

  await page.keyboard.press('a');
  await page.keyboard.press('b');

  await expect(timeline.locator('[data-slot="card-title"]')).toContainText('(2)');
  const rows = timeline.locator('.space-y-1 > div');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).locator(':scope > span')).toHaveText(['1', 'a', /^\d+ms$/]);
  await expect(rows.nth(1).locator(':scope > span')).toHaveText(['2', 'b', /^\d+ms$/]);
});

test('Clear ボタンで 3 つのセクションの記録をまとめて消せる', async ({ page }) => {
  await openApp(page);
  for (const key of ['a', 'b']) {
    await page.keyboard.press(key);
  }

  await section(page, 'Key History').getByRole('button', { name: 'Clear' }).click();

  await expect(section(page, 'Key History')).toContainText(EMPTY.history);
  await expect(section(page, 'Event Type Timeline')).toContainText(EMPTY.eventTimeline);
  await expect(section(page, 'Key Press Timeline')).toContainText(EMPTY.pressTimeline);
});
