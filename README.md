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

### Event Properties
キーボードイベントの詳細なプロパティを表示します。
- `repeat`: キーが長押しされているか
- `location`: キーの位置（左/右/テンキー）
- `isComposing`: IME入力中かどうか
- `timeStamp`: イベント発生時刻
- `bubbles`, `cancelable`: イベントフラグ

### Event Type Timeline
`keydown` → `keypress` → `keyup` のイベント発生順序を時系列で可視化します。

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
