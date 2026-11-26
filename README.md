# EventKeyVisualizer

キーボードイベント（`event.key`, `event.code`, イベント伝播）を学習するためのインタラクティブなツール。

## セクション説明

### Key Display
押したキーの情報を表示します。
- **key**: 押された文字（例: `a`, `A`, `Enter`）
- **code**: 物理キーの位置（例: `KeyA`, `Enter`）
- 修飾キー（Ctrl, Shift, Alt, Meta）の状態

### Virtual Keyboard
US配列キーボードのレイアウトを視覚化します。
- 押したキーがリアルタイムでハイライト
- マウスホバーで各キーの `code` を確認

### Shortcut Detector
キーの組み合わせを検出し、一般的なショートカットを識別します。
- 現在押しているキーの組み合わせを表示
- よく使われるショートカットのリファレンス
- **プラットフォーム検出**: macOS/Windows/Linuxを自動検出し、MODキー（Cmd/Ctrl）を表示
- **ショートカット有効性チェック**: isComposing/repeat状態を監視し、警告表示
- **ステータス表示**: ショートカットが発火するかどうかをリアルタイム判定

### Shortcut Best Practices
キーボードショートカット実装のベストプラクティスを学べるコードスニペット集。
- **MODキー判定ユーティリティ**: クロスプラットフォーム対応のMODキー判定
- **isComposingチェック**: IME入力中の誤発火を防ぐ実装
- **repeatチェック**: キー長押し時の連続発火を防ぐ実装
- **完全な実装例**: すべてのベストプラクティスを組み合わせたサンプル
- 各スニペットはクリップボードにコピー可能

### ショートカット練習場
ベストプラクティスを実際に試せるインタラクティブデモ。
- **isComposing チェック**: 日本語入力中にショートカットをブロックするか確認
  - トグルスイッチで有効/無効を切り替え
  - 入力フィールドで実際にIME入力しながら {MOD}+S を試せる
- **repeat チェック**: キー長押し時の連続発火をブロックするか確認
  - トグルスイッチで有効/無効を切り替え
  - Enterキーの長押しで動作の違いを体験
- イベントログでブロック/発火の結果をリアルタイム確認

### Event Properties
キーボードイベントの詳細なプロパティを表示します。
- `repeat`: キーが長押しされているか
- `location`: キーの位置（左/右/テンキー）
- `isComposing`: IME入力中かどうか
- `timeStamp`: イベント発生時刻
- `bubbles`, `cancelable`: イベントフラグ

### Event Type Timeline
`keydown` → `keypress` → `keyup` のイベント発生順序を時系列で可視化します。

### Key Press Timeline
keydown から keyup までの「押している区間」をタイムラインで可視化します。
- 1行が1回の押下。左の番号が押した順序
- 修飾キーは紫の棒で表示され、文字キーの棒を包んでいれば修飾キーを押したまま押せている
- 長押しによる repeat（緑の縦線）と keypress（青の点）の発生位置を表示
- keyup が届かなかった押下（ブラウザやOSが処理するショートカットなど）は黄色で表示
- Clearボタンで履歴をクリア（Key History・Event Type Timelineと同じ記録を消します）

### Key History
キーイベントの履歴を記録・表示します。
- キー、コード、イベントタイプ、タイムスタンプ
- Clearボタンで履歴をクリア

### Event Propagation Demo
イベントのキャプチャフェーズとバブリングフェーズの仕組みをインタラクティブに体験できます。
- 入れ子になった3つの要素（Grandparent > Parent > Child）
- 各要素で Capture / Stop Propagation / Prevent Default を設定可能
- イベントの伝播経路をログで確認

## 開発

```bash
npm install
npm run dev
```

## 動作確認

ブラウザでの動作確認は Playwright の e2e テストで行います。`tests/e2e/` に各セクションの表示とキー入力に対する動作を確認するテストがあります。

```bash
npm run test:e2e:install   # 初回のみ: e2e テストで使う Chromium を取得
npm run test:e2e           # ヘッドレスで実行 (Vite の開発サーバーは自動で起動)
```

ポート 5175 が使用中だとテスト用のサーバーを起動できないので、先にそのプロセスを止してください。
コードを変更したら `npm run lint`、`npm run build`、`npm run test:e2e` を通してください。

### 開発中の画面確認

開発中に画面を確かめるときは Playwright CLI が使えます。合否の判定は上の `npm run test:e2e` で行います。
`npm run dev` で開発サーバーを起動してから、別のターミナルで:

```bash
npx playwright-cli open http://localhost:5173
npx playwright-cli press Enter
npx playwright-cli console           # コンソールのメッセージ
npx playwright-cli requests --static # ネットワークのリクエスト一覧
npx playwright-cli close
```

同梱の Chromium をダウンロードできない環境 (サンドボックス) では、入っている Chromium のパスを `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` に設定します。
Playwright CLI には同じ値を `PLAYWRIGHT_MCP_EXECUTABLE_PATH` にも設定します。
使い分けやコマンドの詳細は `AGENTS.md` を参照してください。
