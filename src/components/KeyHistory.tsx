import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { KeyEventHistory } from '@/types/keyboard';

interface KeyHistoryProps {
  history: KeyEventHistory[];
  onClear: () => void;
}

export function KeyHistory({ history, onClear }: KeyHistoryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            Key History
            {history.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({history.length})
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">キーイベントの履歴を記録します</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No key events recorded
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
              >
                <Badge variant="secondary" className="font-mono text-base">
                  {item.event.key}
                </Badge>
                <span className="text-muted-foreground text-sm font-mono">
                  {item.event.code}
                </span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {item.event.type}
                </Badge>
                <span className="text-muted-foreground text-xs font-mono">
                  {item.event.timeStamp.toFixed(0)}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
