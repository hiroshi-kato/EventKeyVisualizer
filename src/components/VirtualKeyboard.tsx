import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KEYBOARD_LAYOUT } from './keyboard-layout';
import type { ModifierState } from '@/types/keyboard';
import { getMetaKeyLabel, type Platform } from '@/utils/platform';

interface VirtualKeyboardProps {
  pressedKeys: Set<string>;
  modifiers: ModifierState;
  currentPlatform: Platform;
}

export function VirtualKeyboard({ pressedKeys, modifiers, currentPlatform }: VirtualKeyboardProps) {
  const isKeyPressed = (code: string) => pressedKeys.has(code);
  // Meta キーの刻印は OS で異なる (macOS: ⌘、それ以外: Win)
  const metaKeyLabel = getMetaKeyLabel(currentPlatform);

  const isModifierActive = (code: string) => {
    switch (code) {
      case 'ControlLeft':
      case 'ControlRight':
        return modifiers.ctrlKey;
      case 'ShiftLeft':
      case 'ShiftRight':
        return modifiers.shiftKey;
      case 'AltLeft':
      case 'AltRight':
        return modifiers.altKey;
      case 'MetaLeft':
      case 'MetaRight':
        return modifiers.metaKey;
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Virtual Keyboard</CardTitle>
        <p className="text-sm text-muted-foreground">キーボードレイアウトを視覚化。押したキーがハイライトされます</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1 overflow-x-auto">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-0.5 justify-center">
              {row.keys.map((key) => {
                const pressed = isKeyPressed(key.code) || isModifierActive(key.code);
                const label = key.code === 'MetaLeft' || key.code === 'MetaRight' ? metaKeyLabel : key.label;
                return (
                  <div
                    key={key.code}
                    className={`
                      flex items-center justify-center rounded border text-xs font-mono
                      transition-all duration-75
                      ${pressed
                        ? 'bg-primary text-primary-foreground border-primary scale-95 shadow-inner'
                        : 'bg-card hover:bg-muted border-border'
                      }
                      ${key.type === 'modifier' ? 'text-xs' : ''}
                      ${key.type === 'special' ? 'text-xs' : ''}
                    `}
                    style={{
                      width: `${(key.width || 1) * 28}px`,
                      height: '28px',
                      minWidth: '20px',
                    }}
                    title={`${label} (${key.code})`}
                  >
                    <span className="truncate px-1">{label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press any key to highlight
        </p>
      </CardContent>
    </Card>
  );
}
