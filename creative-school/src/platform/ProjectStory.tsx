import { useState } from "react";
import { Dialog } from "./Dialog";
import { L, useLocale } from "./locale";
import {
  readStory,
  storyLabels,
  storyPrompts,
  writeStory,
} from "./project-story";
export function ProjectStory({
  description,
  busy,
  error,
  onSave,
  onClose,
}: {
  description: string;
  busy: boolean;
  error: string;
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  const { t, lang } = useLocale(),
    [values, setValues] = useState(() => readStory(description)),
    content = writeStory(values, lang);
  return (
    <Dialog
      label={t(
        L("История работы", "The story behind your work", "Жұмыс тарихы"),
      )}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="cs-edit-form cs-story-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (content.length <= 1000) onSave(content);
        }}
      >
        <p className="cs-eyebrow">
          {t(
            L(
              "Авторский взгляд",
              "The creator's perspective",
              "Авторлық көзқарас",
            ),
          )}
        </p>
        <h2>
          {t(
            L(
              "Что стоит за этой работой?",
              "What's behind this piece?",
              "Бұл жұмыстың артында не тұр?",
            ),
          )}
        </h2>
        <p>
          {t(
            L(
              "Расскажите о своих решениях. История появится рядом с опубликованной работой.",
              "Share the decisions you made. Your story appears beside the published piece.",
              "Шешімдеріңіз туралы айтып беріңіз. Тарих жарияланған жұмыстың жанында көрсетіледі.",
            ),
          )}
        </p>
        {storyLabels.map((label, i) => (
          <label key={i}>
            {t(label)}
            <textarea
              aria-label={t(label)}
              rows={3}
              maxLength={1000}
              placeholder={t(storyPrompts[i])}
              value={values[i]}
              onChange={(e) =>
                setValues((v) => {
                  const next = [...v] as typeof v;
                  next[i] = e.target.value;
                  return next;
                })
              }
            />
          </label>
        ))}
        <small
          role="status"
          className={content.length > 1000 ? "cs-danger" : ""}
        >
          {content.length}/1000
        </small>
        {error && (
          <p role="alert" className="cs-inline-error">
            {error}
          </p>
        )}
        <div className="cs-dialog-actions">
          <button
            type="button"
            className="cs-action"
            disabled={busy}
            onClick={onClose}
          >
            {t(L("Отмена", "Cancel", "Бас тарту"))}
          </button>
          <button
            className="cs-action cs-action-primary"
            disabled={
              busy || content.length > 1000 || !values.some((v) => v.trim())
            }
          >
            {t(L("Сохранить историю", "Save story", "Тарихты сақтау"))}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
