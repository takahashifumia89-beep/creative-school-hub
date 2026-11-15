import { useState } from "react";
import { L, useLocale } from "./locale";
const questions = [
  {
    label: L(
      "Что должно получиться?",
      "What should be made?",
      "Қандай нәтиже керек?",
    ),
    hint: L(
      "Например: логотип для маленькой кофейни",
      "For example: a logo for a small coffee shop",
      "Мысалы: шағын кофеханаға логотип",
    ),
  },
  {
    label: L("Для кого и зачем?", "For whom and why?", "Кімге және не үшін?"),
    hint: L(
      "Кто увидит работу и что должен почувствовать?",
      "Who will see it and what should they feel?",
      "Жұмысты кім көреді және қандай әсер алуы керек?",
    ),
  },
  {
    label: L(
      "Настроение и ориентиры",
      "Mood and references",
      "Көңіл күй және бағдарлар",
    ),
    hint: L(
      "Характер, любимые примеры, чего избегать",
      "Character, favorite references, things to avoid",
      "Мінез, ұнайтын үлгілер, неден аулақ болу керек",
    ),
  },
  {
    label: L(
      "Формат и материалы",
      "Format and materials",
      "Пішім және материалдар",
    ),
    hint: L(
      "Размеры, файлы, готовые тексты или исходное видео",
      "Dimensions, files, existing copy or source footage",
      "Өлшемдер, файлдар, дайын мәтін не бастапқы бейне",
    ),
  },
  {
    label: L("Желаемый срок", "Preferred deadline", "Қалаған мерзім"),
    hint: L(
      "Дата или подходящий диапазон",
      "A date or a suitable time range",
      "Күн немесе қолайлы уақыт аралығы",
    ),
  },
];
export function CreativeBrief({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  const { t } = useLocale(),
    [answers, setAnswers] = useState(() => questions.map(() => "")),
    [error, setError] = useState("");
  function apply() {
    const result = questions
        .map((q, i) =>
          answers[i].trim() ? `${t(q.label)}\n${answers[i].trim()}` : "",
        )
        .filter(Boolean)
        .join("\n\n"),
      next = [value.trim(), result].filter(Boolean).join("\n\n");
    if (next.length > 4000) {
      setError(
        t(
          L(
            "Сократите текст: максимум 4000 символов вместе с вашей задачей.",
            "Shorten the text: the task and brief can total at most 4000 characters.",
            "Мәтінді қысқартыңыз: тапсырма мен бриф бірге 4000 таңбадан аспауы керек.",
          ),
        ),
      );
      return;
    }
    onChange(next);
    setAnswers(questions.map(() => ""));
    setError("");
  }
  return (
    <details className="cs-creative-brief">
      <summary>
        {t(
          L(
            "Соберём понятный бриф?",
            "Let's build a clear brief",
            "Түсінікті бриф құрастырайық",
          ),
        )}
      </summary>
      <p>
        {t(
          L(
            "Ответьте на нужные вопросы. Добавьте ответы в задачу и проверьте перед отправкой.",
            "Answer what matters. Add the answers to your task and review before sending.",
            "Қажетті сұрақтарға жауап беріңіз. Жауаптарды тапсырмаға қосып, жіберер алдында тексеріңіз.",
          ),
        )}
      </p>
      {questions.map((q, i) => (
        <label key={i}>
          {t(q.label)}
          <input
            maxLength={600}
            placeholder={t(q.hint)}
            value={answers[i]}
            onChange={(e) =>
              setAnswers((v) => v.map((s, n) => (n === i ? e.target.value : s)))
            }
          />
        </label>
      ))}
      {error && <p role="alert">{error}</p>}
      <button
        type="button"
        disabled={!answers.some((s) => s.trim())}
        onClick={apply}
      >
        {t(
          L(
            "Добавить ответы в задачу",
            "Add answers to the task",
            "Жауаптарды тапсырмаға қосу",
          ),
        )}
      </button>
    </details>
  );
}
