import { useEffect, useRef, useState } from "react";
import { CommandHistory } from "../engine/history";
/** React only publishes snapshots; transaction storage and commands live in the core. */
export function useMediaHistory<T>(value: T, onChange: (value: T) => void) {
  const core = useRef<CommandHistory<T> | null>(null);
  core.current ??= new CommandHistory(value, 50);
  const h = core.current;
  const current = useRef(value);
  current.current = value;
  const [, refresh] = useState(0);
  useEffect(() => {
    if (
      value !== h.value &&
      JSON.stringify(value) !== JSON.stringify(h.value)
    ) {
      h.reset(value);
      refresh((n) => n + 1);
    }
  }, [value]);
  const emit = (next: T) => {
    current.current = next;
    onChange(next);
    refresh((n) => n + 1);
  };
  return {
    commit(next: T) {
      h.update(current.current);
      if (h.commit(next)) emit(h.value);
    },
    begin() {
      if (!h.active) h.update(current.current);
      h.begin();
    },
    update(next: T) {
      if (h.active) {
        h.update(next);
        emit(next);
      } else {
        h.update(current.current);
        if (h.commit(next)) emit(next);
      }
    },
    end() {
      if (h.end()) refresh((n) => n + 1);
    },
    cancel() {
      emit(h.cancel());
    },
    undo() {
      emit(h.undo());
    },
    redo() {
      emit(h.redo());
    },
    canUndo: h.past.length > 0 || h.active,
    canRedo: h.future.length > 0,
  };
}
