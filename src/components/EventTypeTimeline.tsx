import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TimelineEvent } from '@/types/keyboard';

interface EventTypeTimelineProps {
  timeline: TimelineEvent[];
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  keydown: 'bg-green-500',
  keyup: 'bg-red-500',
  keypress: 'bg-blue-500',
};

export function EventTypeTimeline({ timeline }: EventTypeTimelineProps) {
  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Type Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">keydown → keypress → keyup のイベント発生順序を可視化します</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Press any key to see timeline
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate relative timestamps
  const baseTime = timeline[timeline.length - 1]?.timeStamp || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Event Type Timeline
          <span className="text-sm font-normal text-muted-foreground">
            ({timeline.length} events)
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">keydown → keypress → keyup のイベント発生順序を可視化します</p>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <LegendItem color="bg-green-500" label="keydown" />
          <LegendItem color="bg-red-500" label="keyup" />
          <LegendItem color="bg-blue-500" label="keypress" />
        </div>

        {/* Timeline */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 pb-2 min-w-max">
            {timeline.slice(0, 30).map((event, index) => {
              const relativeTime = event.timeStamp - baseTime;
              return (
                <div
                  key={event.id}
                  className="flex flex-col items-center gap-1"
                  style={{ opacity: 1 - index * 0.02 }}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${EVENT_TYPE_COLORS[event.type]}`}
                    title={`${event.type}: ${event.key}`}
                  />
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {relativeTime.toFixed(0)}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event list */}
        <div className="mt-4 max-h-40 overflow-y-auto space-y-1">
          {timeline.slice(0, 15).map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 text-sm"
            >
              <Badge
                variant="outline"
                className={`text-xs ${
                  event.type === 'keydown'
                    ? 'border-green-500 text-green-600'
                    : event.type === 'keyup'
                    ? 'border-red-500 text-red-600'
                    : 'border-blue-500 text-blue-600'
                }`}
              >
                {event.type}
              </Badge>
              <span className="font-mono">{event.key}</span>
              <span className="text-muted-foreground text-xs">({event.code})</span>
              <span className="text-muted-foreground text-xs ml-auto font-mono">
                {event.timeStamp.toFixed(0)}ms
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
