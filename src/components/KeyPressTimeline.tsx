import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MODIFIER_KEY_CODES,
  type KeyboardEventState,
  type KeyPressSegment
} from '@/types/keyboard';

interface KeyPressTimelineProps {
  segments: KeyPressSegment[];
  onClear: () => void;
}

const MIN_SPAN = 200; // ms. Keeps very short recordings readable
const TICK_INTERVAL = 60; // ms. Refresh rate for held-down bars
const AXIS_PERCENTS = [0, 25, 50, 75, 100];
const GRID_COLS = 'grid grid-cols-[2rem_5.5rem_minmax(0,1fr)_4.5rem] items-center gap-2 text-xs';

// Same colors as the Event Type Timeline: keydown / keyup / keypress
const KEYDOWN_CAP = 'bg-green-500';
const KEYUP_CAP = 'bg-red-500';
const KEYUP_LOST_CAP = 'bg-yellow-500';
const HELD_CAP = 'bg-muted-foreground/60 animate-pulse motion-reduce:animate-none';
const MODIFIER_BAR = 'bg-violet-500';
const REPEAT_TICK = 'h-1.5 w-px bg-green-600 dark:bg-green-400';
const KEYPRESS_DOT = 'h-1.5 w-1 rounded-full bg-blue-500';

export function KeyPressTimeline({ segments, onClear }: KeyPressTimelineProps) {
  const hasActive = segments.some(segment => segment.upTime === null);
  const [now, setNow] = useState(() => performance.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSegmentId = segments[segments.length - 1]?.id;

  // Keep extending held-down bars while a key is pressed
  useEffect(() => {
    if (!hasActive) {
      return;
    }
    const timer = window.setInterval(() => setNow(performance.now()), TICK_INTERVAL);
    return () => window.clearInterval(timer);
  }, [hasActive]);

  // Follow new presses when the list overflows
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }, [lastSegmentId]);

  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Press Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">keydown から keyup までの押下区間を可視化します</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Press and hold any key to see press durations
          </p>
        </CardContent>
      </Card>
    );
  }

  // Time axis: 0ms is the first keydown, the end follows the latest event
  const origin = segments[0].keydown.timeStamp;
  const end = Math.max(getLastTime(segments), hasActive ? now : origin, origin + MIN_SPAN);
  const span = end - origin;
  const toPercent = (time: number) => ((time - origin) / span) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            Key Press Timeline
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({segments.length})
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">keydown から keyup までの押下区間を可視化します</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <LegendBar body="bg-primary" label="押下区間 (keydown → keyup)" />
          <LegendBar body={MODIFIER_BAR} label="修飾キー" />
          <LegendItem swatch={REPEAT_TICK} label="repeat (長押し)" />
          <LegendItem swatch={KEYPRESS_DOT} label="keypress" />
          <LegendBar body="bg-primary" end={KEYUP_LOST_CAP} label="keyup 未検出" />
        </div>

        {/* Timeline. max-h-60 fits the time axis (20px) plus exactly 8 rows (24px + 4px gap),
            so the list shows no half-cut row when it follows the newest press */}
        <div ref={scrollRef} className="max-h-60 overflow-auto">
          <div className="min-w-[32rem]">
            {/* Time axis (stays visible while scrolling) */}
            <div className={`${GRID_COLS} sticky top-0 z-10 bg-card pb-1`}>
              <span />
              <span />
              <div className="relative h-4">
                {AXIS_PERCENTS.map((percent) => (
                  <span
                    key={percent}
                    className={`absolute font-mono text-muted-foreground ${
                      percent === 0 ? '' : percent === 100 ? '-translate-x-full' : '-translate-x-1/2'
                    }`}
                    style={{ left: `${percent}%` }}
                  >
                    {Math.round((span * percent) / 100)}ms
                  </span>
                ))}
              </div>
              <span />
            </div>

            {/* One row per key press, oldest first */}
            <div className="space-y-1">
              {segments.map((segment, index) => (
                <PressRow
                  key={segment.id}
                  index={index}
                  segment={segment}
                  toPercent={toPercent}
                  duration={(segment.upTime ?? now) - segment.keydown.timeStamp}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">使い方</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 各行が1回の押下 (keydown → keyup) を表します。左の番号が押した順序です</li>
            <li>• 修飾キーの棒が文字キーの棒を包んでいれば、修飾キーを押したままキーを押せています</li>
            <li>• キーを長押しすると repeat (緑の縦線) と keypress (青の点) が増えていきます</li>
            <li>• ブラウザや OS が処理するショートカットでは keyup が届かないことがあり、その場合は黄色で表示されます</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function PressRow({
  index,
  segment,
  toPercent,
  duration,
}: {
  index: number;
  segment: KeyPressSegment;
  toPercent: (time: number) => number;
  duration: number;
}) {
  const { keydown, upTime } = segment;
  const isModifier = MODIFIER_KEY_CODES.includes(keydown.code);
  const left = toPercent(keydown.timeStamp);
  // A held-down key extends to the right edge of the axis
  const width = (upTime === null ? 100 : toPercent(upTime)) - left;

  // keyup ends the press. Without it the key is either still held down,
  // or the keyup was never observed (e.g. the window lost focus)
  const endCapColor = upTime === null
    ? HELD_CAP
    : segment.keyupLost
    ? KEYUP_LOST_CAP
    : KEYUP_CAP;

  const title = [
    `code: ${keydown.code}`,
    `key: ${JSON.stringify(keydown.key)}`,
    `repeat: ${segment.repeatTimes.length}回 / keypress: ${segment.keypressTimes.length}回`,
    `押下時間: ${Math.round(duration)}ms${segment.keyupLost ? ' (keyup 未検出)' : ''}`,
  ].join('\n');

  return (
    <div className={GRID_COLS} title={title}>
      {/* Press order */}
      <span className="text-right font-mono text-muted-foreground">{index + 1}</span>

      {/* Key label */}
      <span className="truncate font-mono">{getKeyLabel(keydown)}</span>

      {/* Bar */}
      <div className="relative h-6 overflow-hidden rounded bg-muted/50">
        {/* Repeated keydown events (keyed by index: timeStamps are not guaranteed to be unique) */}
        {segment.repeatTimes.map((time, tickIndex) => (
          <span key={tickIndex} className={`absolute top-0.5 ${REPEAT_TICK}`} style={{ left: `${toPercent(time)}%` }} />
        ))}

        {/* Press duration: keydown (green) -> keyup (red) */}
        <div
          className="absolute inset-y-2 flex overflow-hidden rounded-sm"
          style={{
            left: `min(${left}%, calc(100% - 6px))`,
            width: `${width}%`,
            minWidth: '6px',
          }}
        >
          <span className={`w-0.5 shrink-0 ${KEYDOWN_CAP}`} />
          <span className={`min-w-0 flex-1 ${isModifier ? MODIFIER_BAR : 'bg-primary'}`} />
          <span className={`w-0.5 shrink-0 ${endCapColor}`} />
        </div>

        {/* keypress events */}
        {segment.keypressTimes.map((time, dotIndex) => (
          <span key={dotIndex} className={`absolute bottom-0.5 ${KEYPRESS_DOT}`} style={{ left: `calc(${toPercent(time)}% - 2px)` }} />
        ))}
      </div>

      {/* Duration */}
      <span className="truncate text-right font-mono text-muted-foreground">
        {Math.round(duration)}ms{segment.keyupLost ? '*' : ''}
      </span>
    </div>
  );
}

// Latest timeStamp observed in the segments (keydown, keyup, repeat or keypress)
function getLastTime(segments: KeyPressSegment[]): number {
  let last = 0;
  for (const segment of segments) {
    last = Math.max(
      last,
      segment.keydown.timeStamp,
      segment.upTime ?? 0,
      segment.repeatTimes[segment.repeatTimes.length - 1] ?? 0,
      segment.keypressTimes[segment.keypressTimes.length - 1] ?? 0
    );
  }
  return last;
}

function getKeyLabel(event: KeyboardEventState): string {
  if (event.key === ' ') return 'Space';
  if (event.key === '') return event.code;
  return event.key;
}

// Miniature version of a row's bar (keydown cap, body, keyup cap)
function LegendBar({ body, end = KEYUP_CAP, label }: { body: string; end?: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-2 w-8 shrink-0 overflow-hidden rounded-sm">
        <span className={`w-1 shrink-0 ${KEYDOWN_CAP}`} />
        <span className={`min-w-0 flex-1 ${body}`} />
        <span className={`w-1 shrink-0 ${end}`} />
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

// Swatch drawn with the same classes as the marks in the rows
function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-3 w-2 shrink-0 items-center justify-center">
        <span className={`absolute ${swatch}`} />
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
