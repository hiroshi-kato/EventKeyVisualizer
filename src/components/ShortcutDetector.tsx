import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COMMON_SHORTCUTS, type ModifierState } from '@/types/keyboard';

interface ShortcutDetectorProps {
  pressedKeys: Set<string>;
  modifiers: ModifierState;
}

export function ShortcutDetector({ pressedKeys, modifiers }: ShortcutDetectorProps) {
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
