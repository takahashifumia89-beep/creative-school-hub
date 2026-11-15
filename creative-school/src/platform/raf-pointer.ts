import { useEffect, useRef } from "react";
export type PointerSample = {
  clientX: number;
  clientY: number;
  shiftKey: boolean;
  altKey: boolean;
};
/** High-frequency pointer events write scalars; a single callback publishes each frame. */
export function useRafPointer(process: (sample: PointerSample) => void) {
  const callback = useRef(process);
  callback.current = process;
  const sample = useRef<PointerSample>({
      clientX: 0,
      clientY: 0,
      shiftKey: false,
      altKey: false,
    }),
    frame = useRef(0),
    dirty = useRef(false);
  const run = useRef(() => {
    frame.current = 0;
    if (dirty.current) {
      dirty.current = false;
      callback.current(sample.current);
    }
  });
  const move = useRef((e: PointerSample) => {
    const s = sample.current;
    s.clientX = e.clientX;
    s.clientY = e.clientY;
    s.shiftKey = e.shiftKey;
    s.altKey = e.altKey;
    dirty.current = true;
    if (!frame.current) frame.current = requestAnimationFrame(run.current);
  });
  const flush = () => {
    cancelAnimationFrame(frame.current);
    run.current();
  };
  const cancel = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    dirty.current = false;
  };
  useEffect(() => cancel, []);
  return { move: move.current, flush, cancel };
}
