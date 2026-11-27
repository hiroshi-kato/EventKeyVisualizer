import { test as base, expect, type Locator, type Page } from '@playwright/test';

// アプリは navigator.userAgent / navigator.platform で OS を判定するので、
// テストを実行したマシンに関係なく同じになるよう両方を差し替える
type PlatformName = 'windows' | 'mac';

const PROFILES: Record<PlatformName, { userAgent: string; navigatorPlatform: string }> = {
  windows: {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    navigatorPlatform: 'Win32',
  },
  mac: {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    navigatorPlatform: 'MacIntel',
  },
};

function overrideNavigatorPlatform(value: string) {
  Object.defineProperty(Navigator.prototype, 'platform', {
    configurable: true,
    get: () => value,
  });
}

export const test = base.extend<{ platform: PlatformName }>({
  // 既定は Windows。macOS として確かめたいテストは test.use({ platform: 'mac' }) で切り替える
  platform: ['windows', { option: true }],
  userAgent: async ({ platform }, use) => {
    await use(PROFILES[platform].userAgent);
  },
  context: async ({ context, platform }, use) => {
    await context.addInitScript(overrideNavigatorPlatform, PROFILES[platform].navigatorPlatform);
    await use(context);
  },
});

export { expect };

// アプリを開く。キーイベントのリスナーは画面の描画後に登録されるので、
// 描画を待たずに押したキーは捨てられる。見出しが出るまで待ってから返す
export async function openApp(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'EventKeyVisualizer' })).toBeVisible();
}

// タイトル (CardTitle) でセクションを絞り込む
export function section(page: Page, title: string): Locator {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.locator('[data-slot="card-title"]', { hasText: title }) });
}

// keys を順に押したまま body を実行し、終わったら逆順に離す
export async function holdKeys(page: Page, keys: string[], body: () => Promise<void>): Promise<void> {
  for (const key of keys) {
    await page.keyboard.down(key);
  }
  try {
    await body();
  } finally {
    for (const key of [...keys].reverse()) {
      await page.keyboard.up(key);
    }
  }
}

// ページのコンソールエラーと未捕捉の例外を貯めて返す (React の開発用警告も error で出る)
export function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  return errors;
}
