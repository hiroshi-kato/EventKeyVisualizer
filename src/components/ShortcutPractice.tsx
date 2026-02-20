import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { type Platform, getModKeyName } from '@/utils/platform';

interface ShortcutPracticeProps {
  currentPlatform: Platform;
}

interface LogEntry {
  id: number;
  message: string;
  type: 'success' | 'blocked' | 'info';
  timestamp: number;
}

export function ShortcutPractice({ currentPlatform }: ShortcutPracticeProps) {
  const modKeyName = getModKeyName(currentPlatform);

  // isComposing Demo
  const [isComposingEnabled, setIsComposingEnabled] = useState(true);
  const [isComposingLog, setIsComposingLog] = useState<LogEntry[]>([]);
  const isComposingIdRef = useRef(0);

  // repeat Demo
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(true);
  const [repeatLog, setRepeatLog] = useState<LogEntry[]>([]);
  const repeatIdRef = useRef(0);

  const addLog = useCallback((
    setLog: React.Dispatch<React.SetStateAction<LogEntry[]>>,
    idRef: React.MutableRefObject<number>,
    message: string,
    type: 'success' | 'blocked' | 'info'
  ) => {
    idRef.current += 1;
    setLog(prev => [
      { id: idRef.current, message, type, timestamp: Date.now() },
      ...prev.slice(0, 9),
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setIsComposingLog([]);
    setRepeatLog([]);
  }, []);

  const handleIsComposingKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const shortcutKey = `${modKeyName}+S`;

    if (e.key === 's' && (currentPlatform === 'mac' ? e.metaKey : e.ctrlKey)) {
      if (isComposingEnabled && e.nativeEvent.isComposing) {
        e.preventDefault();
        addLog(setIsComposingLog, isComposingIdRef, `${shortcutKey} がブロックされました (IME入力中)`, 'blocked');
      } else {
        e.preventDefault();
        addLog(setIsComposingLog, isComposingIdRef, `${shortcutKey} が発火しました！`, 'success');
      }
    }
  }, [isComposingEnabled, currentPlatform, modKeyName, addLog]);

  const handleRepeatKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isRepeatEnabled && e.nativeEvent.repeat) {
        e.preventDefault();
        addLog(setRepeatLog, repeatIdRef, 'Enter がブロックされました (長押しリピート)', 'blocked');
      } else {
        e.preventDefault();
        addLog(setRepeatLog, repeatIdRef, 'Enter が発火しました！', 'success');
      }
    }
  }, [isRepeatEnabled, addLog]);

  const renderLog = (log: LogEntry[]) => (
    <div className="space-y-1 min-h-[120px] max-h-[120px] overflow-y-auto bg-slate-900 rounded p-2">
      {log.length === 0 ? (
        <p className="text-slate-500 text-xs">ログがありません</p>
      ) : (
        log.map(entry => (
          <div key={entry.id} className="flex items-center gap-2 text-xs">
            <span className={
              entry.type === 'success' ? 'text-green-400' :
              entry.type === 'blocked' ? 'text-red-400' : 'text-blue-400'
            }>
              {entry.type === 'success' ? '✓' : entry.type === 'blocked' ? '✗' : 'ℹ'}
            </span>
            <span className="text-slate-300">{entry.message}</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ショートカット練習場</CardTitle>
            <p className="text-sm text-muted-foreground">
              ベストプラクティスを実際に試してみましょう
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            ログをクリア
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* isComposing Demo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                isComposing チェック
                <Badge variant="outline">IME入力中の動作</Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                日本語入力中にショートカットをブロックするかどうかを試せます
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">チェックを</span>
              <Switch
                checked={isComposingEnabled}
                onCheckedChange={setIsComposingEnabled}
              />
              <span className="text-xs">{isComposingEnabled ? '有効' : '無効'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">入力フィールド ({modKeyName}+S を試してみてください)</label>
              <input
                type="text"
                placeholder="ここで日本語入力をしながらショートカットを試してください"
                className="w-full px-3 py-2 border rounded-md text-sm"
                onKeyDown={handleIsComposingKeyDown}
              />
              <p className="text-xs text-muted-foreground">
                ※ 日本語入力モードで文字を入力中に {modKeyName}+S を押してみてください
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">イベントログ</label>
              {renderLog(isComposingLog)}
            </div>
          </div>
        </div>

        <hr />

        {/* repeat Demo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                repeat チェック
                <Badge variant="outline">長押し時の動作</Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                キー長押し時の連続発火をブロックするかどうかを試せます
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">チェックを</span>
              <Switch
                checked={isRepeatEnabled}
                onCheckedChange={setIsRepeatEnabled}
              />
              <span className="text-xs">{isRepeatEnabled ? '有効' : '無効'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">入力フィールド (Enter を長押ししてみてください)</label>
              <input
                type="text"
                placeholder="ここで Enter キーを長押ししてみてください"
                className="w-full px-3 py-2 border rounded-md text-sm"
                onKeyDown={handleRepeatKeyDown}
              />
              <p className="text-xs text-muted-foreground">
                ※ Enter キーを長押しして、リピートの動作を確認してください
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">イベントログ</label>
              {renderLog(repeatLog)}
            </div>
          </div>
        </div>

        <hr />

        {/* Explanation */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">使い方</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>isComposing</strong>: 日本語入力などIME使用中にショートカットを無効化します。有効時はIME入力中のショートカットがブロックされます。</li>
            <li>• <strong>repeat</strong>: キー長押し時の連続発火を防ぎます。有効時は最初の1回だけ発火します。</li>
            <li>• トグルスイッチでチェックの有効/無効を切り替えて、動作の違いを確認してください。</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
