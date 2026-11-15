import type { ReactNode } from "react";
/** Small, deliberately non-HTML formatter. Model text can never create executable markup. */
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("`") && part.endsWith("`") ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        part
      ),
    );
}
export function AssistantReply({ text }: { text: string }) {
  const lines = text.slice(0, 20000).split("\n").slice(0, 400),
    blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```"))
        code.push(lines[i++]);
      if (i < lines.length) i++;
      blocks.push(
        <pre key={blocks.length}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    if (/^#{1,4}\s/.test(line)) {
      blocks.push(
        <p className="sa-reply-heading" key={blocks.length}>
          {inline(line.replace(/^#{1,4}\s+/, ""))}
        </p>,
      );
      i++;
      continue;
    }
    const ordered = /^\s*\d+[.)]\s+/.test(line),
      list = ordered || /^\s*[-*•]\s+/.test(line);
    if (list) {
      const items: ReactNode[] = [];
      while (
        i < lines.length &&
        (ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*•]\s+/).test(lines[i])
      )
        items.push(
          <li key={items.length}>
            {inline(
              lines[i++].replace(
                ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*•]\s+/,
                "",
              ),
            )}
          </li>,
        );
      blocks.push(
        ordered ? (
          <ol key={blocks.length}>{items}</ol>
        ) : (
          <ul key={blocks.length}>{items}</ul>
        ),
      );
      continue;
    }
    const paragraph: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(?:#{1,4}\s|[-*•]\s|\d+[.)]\s|```)/.test(lines[i])
    )
      paragraph.push(lines[i++]);
    blocks.push(<p key={blocks.length}>{inline(paragraph.join("\n"))}</p>);
  }
  return <div className="sa-reply">{blocks}</div>;
}
