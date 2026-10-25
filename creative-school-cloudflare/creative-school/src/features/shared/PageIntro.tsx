import { type ReactNode } from 'react';

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <div className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </div>
        <h1 className="font-display text-4xl font-medium tracking-[-.06em] sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}