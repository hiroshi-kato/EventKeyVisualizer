import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type CodeSnippet } from '@/types/keyboard';
import { type Platform, getModKeyName } from '@/utils/platform';

interface ShortcutBestPracticesProps {
  currentPlatform: Platform;
}

const getCodeSnippets = (platform: Platform): CodeSnippet[] => {
  const modKey = getModKeyName(platform);
  const modKeyCode = platform === 'mac' ? 'metaKey' : 'ctrlKey';

  return [
    {
      id: 'mod-key',
      title: 'MODキー判定ユーティリティ',
      description: 'クロスプラットフォームでMODキーを判定するユーティリティ関数',
      code: `// プラットフォーム検出
const getPlatform = (): 'mac' | 'windows' | 'linux' => {
  if (navigator.platform.includes('Mac')) return 'mac';
  if (navigator.platform.includes('Win')) return 'windows';
  return 'linux';
};

// MODキーが押されているかチェック
const isModKeyPressed = (e: KeyboardEvent): boolean => {
  const platform = getPlatform();
  // macOS: Cmd (metaKey), Windows/Linux: Ctrl (ctrlKey)
  return platform === 'mac' ? e.metaKey : e.ctrlKey;
};

// 使用例
document.addEventListener('keydown', (e) => {
  if (isModKeyPressed(e) && e.key === 's') {
    e.preventDefault();
    console.log('保存ショートカットが押されました');
  }
});`,
    },
    {
      id: 'is-composing',
      title: 'isComposingチェック',
      description: 'IME入力中のショートカット発火を防ぐチェック',
      code: `// isComposingチェック付きショートカットハンドラ
document.addEventListener('keydown', (e) => {
  // IME入力中はショートカットを無効化
  if (e.isComposing) {
    return; // 日本語入力中などは何もしない
  }

  // ショートカット処理
  if (e.key === 's' && (${modKeyCode})) {
    e.preventDefault();
    console.log('保存処理を実行');
  }
});

// 説明:
// e.isComposing は true の場合、
// ユーザーがIME（日本語入力など）で変換中であることを示します。
// この状態でショートカットを発火させると、
// 意図しない動作になるため、チェックが必要です。`,
    },
    {
      id: 'repeat-check',
      title: 'repeatチェック',
      description: 'キー長押し時の連続発火を防ぐチェック',
      code: `// repeatチェック付きショートカットハンドラ
document.addEventListener('keydown', (e) => {
  // キー長押し時はショートカットを無効化
  if (e.repeat) {
    return; // 長押しによる連続発火を防ぐ
  }

  // ショートカット処理
  if (e.key === 's' && (${modKeyCode})) {
    e.preventDefault();
    console.log('保存処理を実行');
  }
});

// 説明:
// e.repeat は true の場合、
// キーが長押しされて自動リピートしていることを示します。
// ショートカットが一度だけ発火することを保証するために、
// このチェックを入れるのがベストプラクティスです。`,
    },
    {
      id: 'complete-example',
      title: '完全な実装例',
      description: 'すべてのベストプラクティスを組み合わせた実装',
      code: `// 完全なショートカット実装例
type Platform = 'mac' | 'windows' | 'linux';

const getPlatform = (): Platform => {
  if (navigator.platform.includes('Mac')) return 'mac';
  if (navigator.platform.includes('Win')) return 'windows';
  return 'linux';
};

const isModKeyPressed = (e: KeyboardEvent, platform: Platform): boolean => {
  return platform === 'mac' ? e.metaKey : e.ctrlKey;
};

const handleKeyboardShortcut = (e: KeyboardEvent) => {
  // 1. IME入力中チェック
  if (e.isComposing) return;

  // 2. キーリピートチェック
  if (e.repeat) return;

  const platform = getPlatform();

  // 3. 保存ショートカット: ${modKey}+S
  if (e.key === 's' && isModKeyPressed(e, platform)) {
    e.preventDefault();
    console.log('保存');
  }

  // 4. コピー: ${modKey}+C
  if (e.key === 'c' && isModKeyPressed(e, platform)) {
    e.preventDefault();
    console.log('コピー');
  }

  // 5. 検索: ${modKey}+F
  if (e.key === 'f' && isModKeyPressed(e, platform)) {
    e.preventDefault();
    console.log('検索');
  }
};

document.addEventListener('keydown', handleKeyboardShortcut);`,
    },
  ];
};

export function ShortcutBestPractices({ currentPlatform }: ShortcutBestPracticesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const snippets = getCodeSnippets(currentPlatform);

  const handleCopy = async (snippet: CodeSnippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ショートカット実装のベストプラクティス</CardTitle>
        <p className="text-sm text-muted-foreground">
          クロスプラットフォーム対応のショートカット実装例
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {snippets.map((snippet) => (
          <div key={snippet.id} className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-muted/50">
              <div>
                <h4 className="font-medium text-sm">{snippet.title}</h4>
                <p className="text-xs text-muted-foreground">{snippet.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(snippet)}
                className="ml-2 shrink-0"
              >
                {copiedId === snippet.id ? 'コピー済み' : 'コピー'}
              </Button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto bg-slate-900 text-slate-100 dark:bg-slate-950">
              <code>{snippet.code}</code>
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
