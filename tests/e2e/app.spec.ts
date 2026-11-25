import { test, expect, openApp, section, trackConsoleErrors } from './fixtures';

const SECTIONS = [
  'Key Display',
  'Virtual Keyboard',
  'Shortcut Detector',
  'Event Properties',
  'ショートカット実装のベストプラクティス',
  'ショートカット練習場',
  'Event Type Timeline',
  'Key Press Timeline',
  'Key History',
  'Event Propagation Demo',
];

test('すべてのセクションが表示され、コンソールエラーが出ない', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await openApp(page);

  for (const title of SECTIONS) {
    await expect(section(page, title)).toBeVisible();
  }

  // 何も押していないときの初期表示
  await expect(section(page, 'Key Display')).toContainText('-');
  await expect(section(page, 'Shortcut Detector')).toContainText('No keys pressed');
  await expect(section(page, 'Event Properties')).toContainText('Press any key to see properties');
  await expect(section(page, 'Key History')).toContainText('No key events recorded');
  await expect(section(page, 'Event Propagation Demo')).toContainText(
    'Click on Child to focus, then press any key'
  );

  expect(errors).toEqual([]);
});
