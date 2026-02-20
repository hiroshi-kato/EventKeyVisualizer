import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { KeyboardEventState, ModifierState } from '@/types/keyboard';

interface KeyDisplayProps {
  currentEvent: KeyboardEventState | null;
  modifiers: ModifierState;
  shortcutString: string;
}

export function KeyDisplay({ currentEvent, modifiers, shortcutString }: KeyDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Display</CardTitle>
        <p className="text-sm text-muted-foreground">押したキーの key と code を表示します</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main key display */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-6xl font-bold mb-2 font-mono">
            {currentEvent?.key || '-'}
          </div>
          <div className="text-xl text-muted-foreground font-mono">
            {currentEvent?.code || '-'}
          </div>
        </div>

        {/* Shortcut string */}
        {shortcutString && (
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {shortcutString}
            </Badge>
          </div>
        )}

        {/* Modifier keys */}
        <div className="flex flex-wrap justify-center gap-2">
          <ModifierBadge label="Ctrl" active={modifiers.ctrlKey} />
          <ModifierBadge label="Shift" active={modifiers.shiftKey} />
          <ModifierBadge label="Alt" active={modifiers.altKey} />
          <ModifierBadge label="Meta" active={modifiers.metaKey} />
        </div>
      </CardContent>
    </Card>
  );
}

function ModifierBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <Badge
      variant={active ? 'default' : 'outline'}
      className={`min-w-[60px] justify-center transition-colors ${
        active ? 'bg-primary text-primary-foreground' : ''
      }`}
    >
      {label}
    </Badge>
  );
}
