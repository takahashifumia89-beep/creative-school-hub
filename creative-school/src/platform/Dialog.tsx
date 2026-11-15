import { useEffect, useRef, type ReactNode } from "react";
let locks = 0,
  previousOverflow = "";
export function lockScroll() {
  if (!locks++) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    if (!--locks) document.body.style.overflow = previousOverflow;
  };
}
export function Dialog({
  label,
  onClose,
  children,
  className = "",
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const release = lockScroll();
    dialog.showModal();
    return () => {
      dialog.close();
      release();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`cs-dialog ${className}`}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close.current();
      }}
    >
      <div className="cs-dialog-content">{children}</div>
    </dialog>
  );
}
