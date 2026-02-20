import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  KeyboardEventState,
  KeyEventHistory,
  TimelineEvent,
  ModifierState
} from '@/types/keyboard';

const MAX_HISTORY = 20;
const MAX_TIMELINE = 50;

export function useKeyboardEvent() {
  const [currentEvent, setCurrentEvent] = useState<KeyboardEventState | null>(null);
  const [history, setHistory] = useState<KeyEventHistory[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [modifiers, setModifiers] = useState<ModifierState>({
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
  });

  const historyIdRef = useRef(0);
  const timelineIdRef = useRef(0);

  const extractEventState = useCallback((e: KeyboardEvent): KeyboardEventState => {
    return {
      key: e.key,
      code: e.code,
      type: e.type as 'keydown' | 'keyup' | 'keypress',
      timeStamp: e.timeStamp,
      repeat: e.repeat,
      location: e.location,
      isComposing: e.isComposing,
      bubbles: e.bubbles,
      cancelable: e.cancelable,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    };
  }, []);

  const handleKeyEvent = useCallback((e: KeyboardEvent) => {
    const eventState = extractEventState(e);
    setCurrentEvent(eventState);

    // Update modifiers
    setModifiers({
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });

    // Update pressed keys
    if (e.type === 'keydown') {
      setPressedKeys(prev => new Set(prev).add(e.code));
    } else if (e.type === 'keyup') {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.code);
        return newSet;
      });
    }

    // Add to history (only keydown to avoid duplicates)
    if (e.type === 'keydown' && !e.repeat) {
      historyIdRef.current += 1;
      setHistory(prev => [
        { id: historyIdRef.current, event: eventState },
        ...prev.slice(0, MAX_HISTORY - 1),
      ]);
    }

    // Add to timeline
    timelineIdRef.current += 1;
    setTimeline(prev => [
      {
        id: timelineIdRef.current,
        type: e.type as 'keydown' | 'keyup' | 'keypress',
        key: e.key,
        code: e.code,
        timeStamp: e.timeStamp,
      },
      ...prev.slice(0, MAX_TIMELINE - 1),
    ]);
  }, [extractEventState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('keyup', handleKeyEvent);
    window.addEventListener('keypress', handleKeyEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
      window.removeEventListener('keyup', handleKeyEvent);
      window.removeEventListener('keypress', handleKeyEvent);
    };
  }, [handleKeyEvent]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setTimeline([]);
    historyIdRef.current = 0;
    timelineIdRef.current = 0;
  }, []);

  const getShortcutString = useCallback(() => {
    const parts: string[] = [];
    if (modifiers.metaKey) parts.push('Cmd');
    if (modifiers.ctrlKey) parts.push('Ctrl');
    if (modifiers.altKey) parts.push('Alt');
    if (modifiers.shiftKey) parts.push('Shift');

    // Get the non-modifier key
    const nonModifierKeys = Array.from(pressedKeys).filter(
      code => !['MetaLeft', 'MetaRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight'].includes(code)
    );

    if (nonModifierKeys.length > 0) {
      // Convert code to display name
      const keyName = nonModifierKeys[0].replace('Key', '').replace('Digit', '');
      parts.push(keyName);
    }

    return parts.length > 0 ? parts.join(' + ') : '';
  }, [modifiers, pressedKeys]);

  return {
    currentEvent,
    history,
    timeline,
    pressedKeys,
    modifiers,
    clearHistory,
    getShortcutString,
  };
}
