import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COMMON_SHORTCUTS, type ModifierState, type KeyboardEventState, type ShortcutCheckResult } from '@/types/keyboard';
import { getPlatformName, getModKeyName, type Platform } from '@/utils/platform';

interface ShortcutDetectorProps {
  pressedKeys: Set<string>;
  modifiers: ModifierState;
  currentPlatform: Platform;
  currentEvent: KeyboardEventState | null;
  checkValidity: (event: KeyboardEventState | null) => ShortcutCheckResult;
}

export function ShortcutDetector({
  pressedKeys,
  modifiers,
  currentPlatform,
  currentEvent,
  checkValidity
}: ShortcutDetectorProps) {
  const validityResult = checkValidity(currentEvent);
  const platformName = getPlatformName(currentPlatform);
  const modKeyName = getModKeyName(currentPlatform);
  // Get current key combination
  const getCurrentKeyCodes = (): string[] => {
    const keys: string[] = [];

    // Add modifiers first
    if (modifiers.metaKey) keys.push('Meta');
    if (modifiers.ctrlKey) keys.push('Control');
    if (modifiers.altKey) keys.push('Alt');
    if (modifiers.shiftKey) keys.push('Shift');

    // Add non-modifier keys
    pressedKeys.forEach(code => {
      const keyName = codeToKeyName(code);
      if (!['Meta', 'Control', 'Alt', 'Shift'].includes(keyName)) {
        keys.push(keyName);
      }
    });

    return keys;
  };

  const codeToKeyName = (code: string): string => {
    // Convert code to key name
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Arrow')) return code.replace('Arrow', '');

    switch (code) {
      case 'Space': return 'Space';
      case 'Enter': return 'Enter';
      case 'Tab': return 'Tab';
      case 'Escape': return 'Escape';
      case 'Backspace': return 'Backspace';
      case 'MetaLeft':
      case 'MetaRight':
        return 'Meta';
      case 'ControlLeft':
      case 'ControlRight':
        return 'Control';
      case 'AltLeft':
      case 'AltRight':
        return 'Alt';
      case 'ShiftLeft':
      case 'ShiftRight':
        return 'Shift';
      default:
        return code;
    }
  };

  const currentKeys = getCurrentKeyCodes();
  const detectedShortcut = findShortcut(currentKeys);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shortcut Detector</CardTitle>
        <p className="text-sm text-muted-foreground">現在のキー組み合わせを検出し、ショートカットを識別します</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Platform:</span>
            <Badge variant="outline">{platformName}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">MOD Key:</span>
            <Badge variant="secondary">{modKeyName}</Badge>
          </div>
        </div>

        {/* Current keys */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Current combination:</p>
          <div className="flex flex-wrap gap-1">
            {currentKeys.length > 0 ? (
              currentKeys.map((key, index) => (
                <span key={index} className="flex items-center">
                  <Badge variant="secondary" className="font-mono">
                    {key}
                  </Badge>
                  {index < currentKeys.length - 1 && (
                    <span className="mx-1 text-muted-foreground">+</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">No keys pressed</span>
            )}
          </div>
        </div>

        {/* Detected shortcut */}
        {detectedShortcut && (
          <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
            <p className="text-sm font-medium">{detectedShortcut.name}</p>
            <p className="text-xs text-muted-foreground">
              {detectedShortcut.description}
            </p>
          </div>
        )}

        {/* Validity warnings */}
        {validityResult.reasons.length > 0 && (
          <div className="space-y-2">
            {validityResult.reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-md border border-yellow-300 dark:border-yellow-700"
              >
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                <div>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {reason.type}: true
                  </span>
                  <span className="text-xs text-yellow-700 dark:text-yellow-300 ml-2">
                    - {reason.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status */}
        {currentKeys.length > 0 && (
          <div className={`p-2 rounded-md ${validityResult.isValid ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'}`}>
            <span className="text-sm font-medium">
              Status: {validityResult.isValid ? (
                <span className="text-green-700 dark:text-green-300">有効 - ショートカットが発火します</span>
              ) : (
                <span className="text-red-700 dark:text-red-300">無効 - ショートカットは発火しません</span>
              )}
            </span>
          </div>
        )}

        {/* Common shortcuts reference */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Common shortcuts:</p>
          <div className="flex flex-wrap gap-1">
            {COMMON_SHORTCUTS.slice(0, 12).map((shortcut) => (
              <Badge
                key={shortcut.name}
                variant="outline"
                className="text-xs"
              >
                {shortcut.keys.join('+')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function findShortcut(keys: string[]): { name: string; description: string } | null {
  const sortedKeys = [...keys].sort();

  for (const shortcut of COMMON_SHORTCUTS) {
    const sortedShortcutKeys = [...shortcut.keys].sort();
    if (
      sortedKeys.length === sortedShortcutKeys.length &&
      sortedKeys.every((key, index) => key === sortedShortcutKeys[index])
    ) {
      return { name: shortcut.name, description: shortcut.description };
    }
  }

  return null;
}
