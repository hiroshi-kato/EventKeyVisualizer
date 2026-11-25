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

## ルール

- コードを変更したら、完了する前に `npm run lint` / `npm run build` / `npm run test:e2e` がすべて通ることを確認する

## テストの書き方

- e2e テストは `tests/e2e/*.spec.ts` に置き、`./fixtures` から `test` / `expect` を import する
- ページは `openApp(page)` で開く (描画より前に押したキーは捨てられるため)
- OS 依存の表示は `test.use({ platform: 'mac' })` で macOS に切り替えて確認する (既定は Windows)
