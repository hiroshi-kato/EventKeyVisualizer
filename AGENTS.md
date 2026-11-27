# EventKeyVisualizer

キーボードイベント (`event.key`, `event.code`, 伝播) を学ぶための React + TypeScript + Vite 製のツールです。

## セットアップ

```bash
npm install
npm run test:e2e:install   # 初回のみ: e2e テストで使う Chromium を取得
```

## 確認コマンド

```bash
npm run lint
npm run build
npm run test:e2e           # tests/e2e/ をヘッドレスの Chromium で実行
```

`npm run test:e2e` は Vite の開発サーバー (ポート 5175) を自動で起動し、終了時に止めます。
ポートが使用中だと起動に失敗するので、先にそのプロセスを止めてください。

## 画面確認

開発中の画面確認は Playwright CLI を使い、合否の判定は `npm run test:e2e` で行います。
CLI の使い方はスキル `.claude/skills/playwright-cli/` にあります。スキルに書かれた `playwright-cli` は、ここでは `npx playwright-cli` です。
CLI を更新したら `npx playwright-cli install --skills` でスキルも入れ直します。

`npm run dev` で開発サーバーを起動してから、別のターミナルで:

```bash
npx playwright-cli open http://localhost:5173
npx playwright-cli find "Shortcut Detector"   # 表示を探す
npx playwright-cli keydown Control            # keyup で離す。press は押して離す
npx playwright-cli console error              # コンソール (既定は info)
npx playwright-cli requests --static          # ネットワーク (JS などは --static を付けないと出ない)
npx playwright-cli screenshot
npx playwright-cli close
```

OS 依存の表示はブラウザの UA で決まるので、Windows / macOS として見るときは `open --config` で `browser.contextOptions.userAgent` を設定します。

### 同梱の Chromium を使えない環境 (サンドボックス)

Chromium をダウンロードできない環境では、入っている Chromium のパスを `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` に設定します (サンドボックスなら `/usr/bin/chromium`)。
`npm run test:e2e` はこの変数が設定されているときだけそのブラウザを起動し、未設定なら今までどおり同梱ブラウザを使います。

Playwright CLI はこの変数を認識しないので、同じ値を CLI 側の `PLAYWRIGHT_MCP_EXECUTABLE_PATH` にも設定します。

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
PLAYWRIGHT_MCP_EXECUTABLE_PATH=/usr/bin/chromium npx playwright-cli open http://localhost:5173
```

## ルール

- コードを変更したら、完了する前に `npm run lint` / `npm run build` / `npm run test:e2e` がすべて通ることを確認する

## テストの書き方

- e2e テストは `tests/e2e/*.spec.ts` に置き、`./fixtures` から `test` / `expect` を import する
- ページは `openApp(page)` で開く (描画より前に押したキーは捨てられるため)
- OS 依存の表示は `test.use({ platform: 'mac' })` で macOS に切り替えて確認する (既定は Windows)
