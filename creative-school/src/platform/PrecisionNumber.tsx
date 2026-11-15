import { useEffect, useRef, useState } from "react";
import { L, useLocale } from "./locale";
import "./precision-number.css";
type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
  inputClassName?: string;
  onBegin?: () => void;
  onValue?: (value: number) => void;
  onEnd?: () => void;
  onCommit?: (value: number) => void;
};
export function PrecisionNumber(props: Props) {
  const { t } = useLocale(),
    latest = useRef(props),
    [raw, setRaw] = useState(String(props.value));
  latest.current = props;
  const input = useRef<HTMLInputElement>(null),
    editing = useRef(false),
    start = useRef(props.value);
  const drag = useRef({
    active: false,
    value: props.value,
    origin: props.value,
    lastX: 0,
    frame: 0,
    dirty: false,
    target: null as HTMLButtonElement | null,
  });
  const clamp = (n: number) =>
    Math.max(
      latest.current.min ?? -10000,
      Math.min(latest.current.max ?? 10000, n),
    );
  useEffect(() => {
    if (!editing.current && !drag.current.active)
      setRaw(String(Number(props.value.toFixed(5))));
  }, [props.value]);
  useEffect(() => {
    const publish = () => {
      const d = drag.current;
      d.frame = 0;
      if (!d.dirty) return;
      d.dirty = false;
      setRaw(String(d.value));
      latest.current.onValue?.(d.value);
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      const dx =
        document.pointerLockElement === d.target
          ? e.movementX
          : e.clientX - d.lastX;
      d.lastX = e.clientX;
      if (!dx) return;
      const step =
        (latest.current.step ?? 1) * (e.shiftKey ? 10 : e.altKey ? 0.1 : 1);
      d.value = Number(clamp(d.value + (dx * step) / 4).toFixed(6));
      d.dirty = true;
      if (!d.frame) d.frame = requestAnimationFrame(publish);
    };
    const finish = (cancel = false) => {
      const d = drag.current;
      if (!d.active) return;
      cancelAnimationFrame(d.frame);
      d.frame = 0;
      if (cancel) {
        d.value = d.origin;
        d.dirty = true;
      }
      publish();
      d.active = false;
      if (!cancel) latest.current.onCommit?.(d.value);
      latest.current.onEnd?.();
      if (document.pointerLockElement === d.target) document.exitPointerLock();
    };
    const up = () => finish(),
      cancel = () => finish(true);
    const key = (e: KeyboardEvent) => {
      if (drag.current.active && e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    };
    const lock = () => {
      if (drag.current.active && !document.pointerLockElement) finish(true);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", key);
    document.addEventListener("pointerlockchange", lock);
    return () => {
      cancelAnimationFrame(drag.current.frame);
      if (document.pointerLockElement === drag.current.target)
        document.exitPointerLock();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", key);
      document.removeEventListener("pointerlockchange", lock);
    };
  }, []);
  return (
    <label
      className={
        (props.className ?? "precision-number") +
        (props.compact ? " is-compact" : "")
      }
    >
      <span className="precision-label">
        <span className="precision-name">{props.label}</span>
        <button
          type="button"
          className="precision-scrub"
          data-scrub={props.label}
          aria-label={`${props.label} · ${t(L("изменить перетаскиванием", "drag to adjust", "тартып өзгерту"))}`}
          title={t(
            L(
              "Тяните ↔ · Shift ×10 · Alt ×0,1 · Esc — отмена",
              "Drag ↔ · Shift ×10 · Alt ×0.1 · Esc cancels",
              "Тартыңыз ↔ · Shift ×10 · Alt ×0,1 · Esc — болдырмау",
            ),
          )}
          disabled={props.disabled}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            input.current?.blur();
            const d = drag.current;
            d.active = true;
            d.value = latest.current.value;
            d.origin = d.value;
            d.lastX = e.clientX;
            d.target = e.currentTarget;
            latest.current.onBegin?.();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
              const locked = e.currentTarget.requestPointerLock?.();
              locked?.catch(() => undefined);
            } catch {
              /* Pointer capture remains available. */
            }
          }}
        >
          ↔
        </button>
      </span>
      <input
        ref={input}
        className={props.inputClassName}
        aria-label={props.label}
        type="number"
        inputMode="decimal"
        value={raw}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        disabled={props.disabled}
        onFocus={() => {
          editing.current = true;
          start.current = latest.current.value;
          latest.current.onBegin?.();
        }}
        onChange={(e) => {
          setRaw(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value.trim() && Number.isFinite(n))
            latest.current.onValue?.(clamp(n));
        }}
        onBlur={() => {
          if (!editing.current) return;
          editing.current = false;
          const n = Number(raw);
          if (raw.trim() && Number.isFinite(n))
            latest.current.onCommit?.(clamp(n));
          else {
            latest.current.onValue?.(start.current);
            setRaw(String(start.current));
          }
          latest.current.onEnd?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            editing.current = false;
            setRaw(String(start.current));
            latest.current.onValue?.(start.current);
            latest.current.onEnd?.();
            e.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}
