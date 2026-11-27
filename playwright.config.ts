import { defineConfig } from '@playwright/test';

// npm run dev の既定ポート (5173) とは別にして、開発中のサーバーと衝突しないようにする
const PORT = 5175;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// 同梱の Chromium をダウンロードできない環境で、代わりに起動する Chromium のパス。
// 未設定なら今までどおり同梱ブラウザを使う
const EXECUTABLE_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests/e2e',
  // 既定の HTML レポートは失敗時にブラウザを開いて待機するため、結果は標準出力に出す
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    ...(EXECUTABLE_PATH && { launchOptions: { executablePath: EXECUTABLE_PATH } }),
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // 通常の Chromium (new headless) で動かす。既定の headless shell より実際のブラウザに近い
        channel: 'chromium',
      },
    },
  ],
  // テスト開始時に開発サーバーを起動する (既にポートが使われていたらエラーで止まる)
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
  },
});
