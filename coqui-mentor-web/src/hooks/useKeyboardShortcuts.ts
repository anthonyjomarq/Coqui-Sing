import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onRecord?: () => void;      // R key to record/pause
  onStop?: () => void;         // S or Esc to stop
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onRecord,
  onStop,
  enabled = true
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for modifier keys to avoid conflicts
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;

      switch (e.key.toLowerCase()) {
        case 'r':
          // R key to record/pause (easy to remember: R = Record)
          if (!hasModifier) {
            e.preventDefault();
            e.stopPropagation();
            onRecord?.();
          }
          break;

        case 's':
          // S key to stop (easy to remember: S = Stop)
          if (!hasModifier) {
            e.preventDefault();
            e.stopPropagation();
            onStop?.();
          }
          break;

        case 'escape':
          // Esc also stops (backup option)
          e.preventDefault();
          e.stopPropagation();
          onStop?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [onRecord, onStop, enabled]);
}
