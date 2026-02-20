export interface KeyboardEventState {
  key: string;
  code: string;
  type: 'keydown' | 'keyup' | 'keypress';
  timeStamp: number;
  repeat: boolean;
  location: number;
  isComposing: boolean;
  bubbles: boolean;
  cancelable: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface KeyEventHistory {
  id: number;
  event: KeyboardEventState;
}

export interface TimelineEvent {
  id: number;
  type: 'keydown' | 'keyup' | 'keypress';
  key: string;
  code: string;
  timeStamp: number;
}

export interface ModifierState {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface PropagationLog {
  id: number;
  phase: 'capture' | 'target' | 'bubble';
  element: 'grandparent' | 'parent' | 'child';
  eventName: string;
  stopped: boolean;
  prevented: boolean;
}

export interface ShortcutDefinition {
  keys: string[];
  name: string;
  description: string;
}

export interface ShortcutCheckResult {
  isValid: boolean;
  reasons: InvalidReason[];
}

export interface InvalidReason {
  type: 'isComposing' | 'repeat';
  message: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const COMMON_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ['Control', 's'], name: 'Save', description: '保存' },
  { keys: ['Control', 'c'], name: 'Copy', description: 'コピー' },
  { keys: ['Control', 'v'], name: 'Paste', description: 'ペースト' },
  { keys: ['Control', 'x'], name: 'Cut', description: '切り取り' },
  { keys: ['Control', 'z'], name: 'Undo', description: '元に戻す' },
  { keys: ['Control', 'y'], name: 'Redo', description: 'やり直し' },
  { keys: ['Control', 'a'], name: 'Select All', description: '全選択' },
  { keys: ['Control', 'f'], name: 'Find', description: '検索' },
  { keys: ['Meta', 's'], name: 'Save (Mac)', description: '保存 (Mac)' },
  { keys: ['Meta', 'c'], name: 'Copy (Mac)', description: 'コピー (Mac)' },
  { keys: ['Meta', 'v'], name: 'Paste (Mac)', description: 'ペースト (Mac)' },
  { keys: ['Meta', 'x'], name: 'Cut (Mac)', description: '切り取り (Mac)' },
  { keys: ['Meta', 'z'], name: 'Undo (Mac)', description: '元に戻す (Mac)' },
  { keys: ['Meta', 'a'], name: 'Select All (Mac)', description: '全選択 (Mac)' },
  { keys: ['Alt', 'Tab'], name: 'Switch Window', description: 'ウィンドウ切り替え' },
  { keys: ['Shift', 'Tab'], name: 'Reverse Tab', description: '逆タブ移動' },
  { keys: ['Escape'], name: 'Escape', description: 'キャンセル/閉じる' },
  { keys: ['Enter'], name: 'Enter', description: '決定' },
  { keys: ['Space'], name: 'Space', description: 'スペース' },
  { keys: ['ArrowUp'], name: 'Arrow Up', description: '上矢印' },
  { keys: ['ArrowDown'], name: 'Arrow Down', description: '下矢印' },
  { keys: ['ArrowLeft'], name: 'Arrow Left', description: '左矢印' },
  { keys: ['ArrowRight'], name: 'Arrow Right', description: '右矢印' },
];
