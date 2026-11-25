import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { PropagationLog } from '@/types/keyboard';

export function PropagationDemo() {
  const [logs, setLogs] = useState<PropagationLog[]>([]);
  const [stopPropagation, setStopPropagation] = useState({
    child: false,
    parent: false,
    grandparent: false,
  });
  const [useCapture, setUseCapture] = useState({
    child: false,
    parent: false,
    grandparent: false,
  });
  const [preventDefault, setPreventDefault] = useState<Record<'grandparent' | 'parent' | 'child', boolean>>({
    child: false,
    parent: false,
    grandparent: false,
  });

  const logIdRef = useRef(0);
  const childRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((
    phase: 'capture' | 'target' | 'bubble',
    element: 'grandparent' | 'parent' | 'child',
    eventName: string,
    stopped: boolean,
    prevented: boolean
  ) => {
    logIdRef.current += 1;
    // 時系列順に表示（古いものが上、新しいものが下）
    setLogs(prev => [
      ...prev.slice(-49),
      { id: logIdRef.current, phase, element, eventName, stopped, prevented },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // キャプチャフェーズ用ハンドラ（onKeyDownCapture/onKeyUpCaptureから呼ばれる）
  const handleCapture = useCallback((
    e: React.KeyboardEvent,
    element: 'grandparent' | 'parent' | 'child'
  ) => {
    // CaptureフラグがONの場合のみログに記録
    if (useCapture[element]) {
      const shouldStop = stopPropagation[element];
      const shouldPrevent = preventDefault[element];

      addLog('capture', element, e.type, shouldStop, shouldPrevent);

      if (shouldStop) {
        e.stopPropagation();
      }

      if (shouldPrevent) {
        e.preventDefault();
      }
    }
  }, [useCapture, stopPropagation, preventDefault, addLog]);

  // バブリングフェーズ用ハンドラ（onKeyDown/onKeyUpから呼ばれる）
  const handleBubble = useCallback((
    e: React.KeyboardEvent,
    element: 'grandparent' | 'parent' | 'child'
  ) => {
    const shouldStop = stopPropagation[element];
    const shouldPrevent = preventDefault[element];

    // Determine phase: target if this is the event source, otherwise bubble
    const phase: 'target' | 'bubble' = e.target === e.currentTarget ? 'target' : 'bubble';

    addLog(phase, element, e.type, shouldStop, shouldPrevent);

    if (shouldStop) {
      e.stopPropagation();
    }

    if (shouldPrevent) {
      e.preventDefault();
    }
  }, [stopPropagation, preventDefault, addLog]);

  const focusChild = useCallback(() => {
    childRef.current?.focus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Event Propagation Demo</span>
          <div className="flex gap-2">
            <button
              onClick={focusChild}
              className="text-xs px-2 py-1 bg-secondary rounded hover:bg-secondary/80"
            >
              Focus Child
            </button>
            <button
              onClick={clearLogs}
              className="text-xs px-2 py-1 bg-secondary rounded hover:bg-secondary/80"
            >
              Clear Logs
            </button>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">イベントのキャプチャとバブリングの仕組みを体験できます</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="font-medium">Element</div>
          <div className="font-medium">Capture</div>
          <div className="font-medium">Stop Prop.</div>
          <div className="font-medium">Prevent Def.</div>

          <div>Grandparent</div>
          <Switch
            checked={useCapture.grandparent}
            onCheckedChange={(checked) =>
              setUseCapture(prev => ({ ...prev, grandparent: checked }))
            }
          />
          <Switch
            checked={stopPropagation.grandparent}
            onCheckedChange={(checked) =>
              setStopPropagation(prev => ({ ...prev, grandparent: checked }))
            }
          />
          <div className="text-muted-foreground">-</div>

          <div>Parent</div>
          <Switch
            checked={useCapture.parent}
            onCheckedChange={(checked) =>
              setUseCapture(prev => ({ ...prev, parent: checked }))
            }
          />
          <Switch
            checked={stopPropagation.parent}
            onCheckedChange={(checked) =>
              setStopPropagation(prev => ({ ...prev, parent: checked }))
            }
          />
          <div className="text-muted-foreground">-</div>

          <div>Child</div>
          <Switch
            checked={useCapture.child}
            onCheckedChange={(checked) =>
              setUseCapture(prev => ({ ...prev, child: checked }))
            }
          />
          <Switch
            checked={stopPropagation.child}
            onCheckedChange={(checked) =>
              setStopPropagation(prev => ({ ...prev, child: checked }))
            }
          />
          <Switch
            checked={preventDefault.child}
            onCheckedChange={(checked) =>
              setPreventDefault(prev => ({ ...prev, child: checked }))
            }
          />
        </div>

        {/* Nested elements */}
        <div className="flex justify-center">
          <div
            className="w-full max-w-md p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950"
            onKeyDownCapture={(e) => handleCapture(e, 'grandparent')}
            onKeyDown={(e) => handleBubble(e, 'grandparent')}
            onKeyUpCapture={(e) => handleCapture(e, 'grandparent')}
            onKeyUp={(e) => handleBubble(e, 'grandparent')}
          >
            <p className="text-xs text-center mb-2 text-blue-600 dark:text-blue-400">
              Grandparent
            </p>
            <div
              className="p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950"
              onKeyDownCapture={(e) => handleCapture(e, 'parent')}
              onKeyDown={(e) => handleBubble(e, 'parent')}
              onKeyUpCapture={(e) => handleCapture(e, 'parent')}
              onKeyUp={(e) => handleBubble(e, 'parent')}
            >
              <p className="text-xs text-center mb-2 text-green-600 dark:text-green-400">
                Parent
              </p>
              <div
                ref={childRef}
                tabIndex={0}
                className="p-4 border-2 border-red-500 rounded-lg bg-red-50 dark:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-400"
                onKeyDownCapture={(e) => handleCapture(e, 'child')}
                onKeyDown={(e) => handleBubble(e, 'child')}
                onKeyUpCapture={(e) => handleCapture(e, 'child')}
                onKeyUp={(e) => handleBubble(e, 'child')}
              >
                <p className="text-xs text-center text-red-600 dark:text-red-400">
                  Child (click to focus, then type)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="max-h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm py-2">
              Click on Child to focus, then press any key
            </p>
          ) : (
            <div className="space-y-1">
              {logs.slice(0, 15).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-2 text-xs p-1 rounded bg-muted/50"
                >
                  <Badge
                    variant={
                      log.phase === 'capture'
                        ? 'default'
                        : log.phase === 'target'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-xs"
                  >
                    {log.phase}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      log.element === 'grandparent'
                        ? 'border-blue-500'
                        : log.element === 'parent'
                        ? 'border-green-500'
                        : 'border-red-500'
                    }`}
                  >
                    {log.element}
                  </Badge>
                  {log.stopped && (
                    <Badge variant="destructive" className="text-xs">
                      stopped
                    </Badge>
                  )}
                  {log.prevented && (
                    <Badge variant="outline" className="text-xs border-yellow-500">
                      prevented
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
