import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { KeyboardEventState } from '@/types/keyboard';

interface EventPropertiesProps {
  currentEvent: KeyboardEventState | null;
}

const LOCATION_LABELS: Record<number, string> = {
  0: 'Standard',
  1: 'Left',
  2: 'Right',
  3: 'Numpad',
};

export function EventProperties({ currentEvent }: EventPropertiesProps) {
  if (!currentEvent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Properties</CardTitle>
          <p className="text-sm text-muted-foreground">repeat, location, isComposing などのイベントプロパティを表示します</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Press any key to see properties
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Properties</CardTitle>
        <p className="text-sm text-muted-foreground">repeat, location, isComposing などのイベントプロパティを表示します</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <PropertyRow label="repeat" value={currentEvent.repeat.toString()} />
          <PropertyRow
            label="location"
            value={`${currentEvent.location} (${LOCATION_LABELS[currentEvent.location] || 'Unknown'})`}
          />
          <PropertyRow label="isComposing" value={currentEvent.isComposing.toString()} />
          <PropertyRow
            label="timeStamp"
            value={`${currentEvent.timeStamp.toFixed(2)}ms`}
            isMono
          />
          <PropertyRow label="bubbles" value={currentEvent.bubbles.toString()} />
          <PropertyRow label="cancelable" value={currentEvent.cancelable.toString()} />
          <PropertyRow label="type" value={currentEvent.type} />
        </div>
      </CardContent>
    </Card>
  );
}

function PropertyRow({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: string;
  isMono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <Badge variant="secondary" className={`justify-start ${isMono ? 'font-mono' : ''}`}>
        {value}
      </Badge>
    </div>
  );
}
