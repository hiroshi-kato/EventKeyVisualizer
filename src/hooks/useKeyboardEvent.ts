import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  KeyboardEventState,
  KeyEventHistory,
  TimelineEvent,
  ModifierState,
  ShortcutCheckResult,
  InvalidReason,
  KeyPressSegment
} from '@/types/keyboard';
import { detectPlatform, type Platform } from '@/utils/platform';
import { applyPressEvent, closeOpenPressSegments } from '@/utils/pressSegment';

const MAX_HISTORY = 20;
const MAX_TIMELINE = 50;

export function useKeyboardEvent() {
  const [currentEvent, setCurrentEvent] = useState<KeyboardEventState | null>(null);
  const [history, setHistory] = useState<KeyEventHistory[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [pressSegments, setPressSegments] = useState<KeyPressSegment[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [modifiers, setModifiers] = useState<ModifierState>({
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
  });
  const [currentPlatform] = useState<Platform>(() => detectPlatform());

  const historyIdRef = useRef(0);
  const timelineIdRef = useRef(0);
  const pressIdRef = useRef(0);

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

    // Update press segments (keydown -> keyup pairs), oldest first
    if (e.type === 'keydown') {
      pressIdRef.current += 1;
    }
    // Read the id here: inside the updater it could already point at a later keydown
    const pressSegmentId = pressIdRef.current;
    setPressSegments(prev => applyPressEvent(prev, eventState, pressSegmentId));
  }, [extractEventState]);

  // keyup is not delivered when the window loses focus, so reset the held keys
  useEffect(() => {
    const handleBlur = () => {
      setPressedKeys(new Set());
      setModifiers({
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
      });
      setPressSegments(prev => closeOpenPressSegments(prev, performance.now()));
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

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
    setPressSegments([]);
    historyIdRef.current = 0;
    timelineIdRef.current = 0;
    pressIdRef.current = 0;
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

  const checkShortcutValidity = useCallback((event: KeyboardEventState | null): ShortcutCheckResult => {
    const reasons: InvalidReason[] = [];

    if (event?.isComposing) {
      reasons.push({
        type: 'isComposing',
        message: 'IME入力中はショートカットが無効です',
      });
    }

    if (event?.repeat) {
      reasons.push({
        type: 'repeat',
        message: 'キー長押し中はショートカットが無効です',
      });
    }

    return {
      isValid: reasons.length === 0,
      reasons,
    };
  }, []);

  return {
    currentEvent,
    history,
    timeline,
    pressSegments,
    pressedKeys,
    modifiers,
    currentPlatform,
    clearHistory,
    getShortcutString,
    checkShortcutValidity,
  };
}
