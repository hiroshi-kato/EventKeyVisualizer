import { useKeyboardEvent } from '@/hooks/useKeyboardEvent';
import { KeyDisplay } from '@/components/KeyDisplay';
import { EventTypeTimeline } from '@/components/EventTypeTimeline';
import { KeyHistory } from '@/components/KeyHistory';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { EventProperties } from '@/components/EventProperties';
import { PropagationDemo } from '@/components/PropagationDemo';
import { ShortcutDetector } from '@/components/ShortcutDetector';

function App() {
  const {
    currentEvent,
    history,
    timeline,
    pressedKeys,
    modifiers,
    clearHistory,
    getShortcutString,
  } = useKeyboardEvent();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <header className="text-center py-4">
          <h1 className="text-3xl font-bold">EventKeyVisualizer</h1>
          <p className="text-muted-foreground mt-1">
            Press any key to explore keyboard events
          </p>
        </header>

        {/* Row 1: KeyDisplay + VirtualKeyboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KeyDisplay
            currentEvent={currentEvent}
            modifiers={modifiers}
            shortcutString={getShortcutString()}
          />
          <VirtualKeyboard pressedKeys={pressedKeys} modifiers={modifiers} />
        </div>

        {/* Row 2: ShortcutDetector + EventProperties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ShortcutDetector pressedKeys={pressedKeys} modifiers={modifiers} />
          <EventProperties currentEvent={currentEvent} />
        </div>

        {/* Row 3: EventTypeTimeline (full width) */}
        <EventTypeTimeline timeline={timeline} />

        {/* Row 4: KeyHistory + PropagationDemo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KeyHistory history={history} onClear={clearHistory} />
          <PropagationDemo />
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-4">
          Keyboard Event Learning Tool | event.key, event.code, and event propagation
        </footer>
      </div>
    </div>
  );
}

export default App;
