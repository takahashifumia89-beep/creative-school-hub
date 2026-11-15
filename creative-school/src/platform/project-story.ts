import { L, type Lang, type Localized } from "./locale";
export const storyLabels = [
  L("Задача", "The challenge", "Міндет"),
  L("Моё решение", "My approach", "Менің шешімім"),
  L("Результат и вывод", "Outcome & reflection", "Нәтиже және қорытынды"),
] as const;
export const storyPrompts = [
  L(
    "Для кого эта работа и что она должна передать?",
    "Who is this for and what should it communicate?",
    "Бұл жұмыс кімге арналған және қандай ойды жеткізуі керек?",
  ),
  L(
    "Почему вы выбрали именно эту форму, цвет или ритм?",
    "Why did you choose this form, color or rhythm?",
    "Неге осы пішінді, түсті не ырғақты таңдадыңыз?",
  ),
  L(
    "Что получилось? Что вы попробовали бы в следующей версии?",
    "What worked? What would you try in the next version?",
    "Не сәтті шықты? Келесі нұсқада нені байқап көрер едіңіз?",
  ),
] as const;
export function readStory(description: string): [string, string, string] {
  const found: { start: number; end: number; index: number }[] = [];
  for (let i = 0; i < 3; i++)
    for (const label of storyLabels[i]) {
      const prefix = label + ":\n",
        start = description.indexOf(prefix);
      if (
        start === 0 ||
        (start > 1 && description.slice(start - 2, start) === "\n\n")
      )
        found.push({ start, end: start + prefix.length, index: i });
    }
  found.sort((a, b) => a.start - b.start);
  if (
    found.length !== 3 ||
    found[0].start !== 0 ||
    new Set(found.map((f) => f.index)).size !== 3
  )
    return [description, "", ""];
  const values: [string, string, string] = ["", "", ""];
  found.forEach((f, i) => {
    values[f.index] = description
      .slice(f.end, found[i + 1]?.start ?? description.length)
      .trim();
  });
  return values;
}
export function writeStory(values: readonly string[], lang: Lang) {
  const t = (l: Localized) => l[lang === "ru" ? 0 : lang === "en" ? 1 : 2];
  return values
    .map((value, i) => `${t(storyLabels[i])}:\n${value.trim()}`)
    .join("\n\n");
}
