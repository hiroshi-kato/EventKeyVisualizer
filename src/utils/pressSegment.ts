import type { KeyboardEventState, KeyPressSegment } from '@/types/keyboard';

export const MAX_PRESS_SEGMENTS = 20;
// Caps so that holding a key down for a long time cannot grow the list indefinitely
const MAX_REPEAT_TIMES = 500;
const MAX_KEYPRESS_TIMES = 500;

// Find the segment of the same physical key that is still held down
function findOpenIndex(segments: KeyPressSegment[], event: KeyboardEventState): number {
  return segments.findIndex(
    segment => segment.keydown.code === event.code && segment.upTime === null
  );
}

function replaceAt(
  segments: KeyPressSegment[],
  index: number,
  segment: KeyPressSegment
): KeyPressSegment[] {
  return [...segments.slice(0, index), segment, ...segments.slice(index + 1)];
}

// Reflect a single keydown / keyup / keypress event on the list of press segments
export function applyPressEvent(
  segments: KeyPressSegment[],
  event: KeyboardEventState,
  newSegmentId: number
): KeyPressSegment[] {
  const openIndex = findOpenIndex(segments, event);
  const open = openIndex >= 0 ? segments[openIndex] : null;

  if (event.type === 'keydown') {
    if (open) {
      if (event.repeat) {
        // Auto repeat while the key is held down
        const repeatTimes = [...open.repeatTimes, event.timeStamp];
        return replaceAt(segments, openIndex, {
          ...open,
          repeatTimes: repeatTimes.slice(-MAX_REPEAT_TIMES),
        });
      }

      // The same key was pressed again without a keyup in between:
      // close the previous segment and start a new one
      const closed: KeyPressSegment = { ...open, upTime: event.timeStamp, keyupLost: true };
      return [...replaceAt(segments, openIndex, closed), createSegment(event, newSegmentId)]
        .slice(-MAX_PRESS_SEGMENTS);
    }

    return [...segments, createSegment(event, newSegmentId)].slice(-MAX_PRESS_SEGMENTS);
  }

  // keyup / keypress of a key whose keydown was not recorded (e.g. before Clear)
  if (!open) {
    return segments;
  }

  if (event.type === 'keyup') {
    return replaceAt(segments, openIndex, { ...open, upTime: event.timeStamp });
  }

  const keypressTimes = [...open.keypressTimes, event.timeStamp];
  return replaceAt(segments, openIndex, {
    ...open,
    keypressTimes: keypressTimes.slice(-MAX_KEYPRESS_TIMES),
  });
}

function createSegment(event: KeyboardEventState, id: number): KeyPressSegment {
  return {
    id,
    keydown: event,
    upTime: null,
    keyupLost: false,
    repeatTimes: [],
    keypressTimes: [],
  };
}

// Close every segment that is still held down (used when keyup will never arrive)
export function closeOpenPressSegments(
  segments: KeyPressSegment[],
  time: number
): KeyPressSegment[] {
  const hasOpen = segments.some(segment => segment.upTime === null);
  if (!hasOpen) {
    return segments;
  }

  return segments.map(segment =>
    segment.upTime === null ? { ...segment, upTime: time, keyupLost: true } : segment
  );
}
