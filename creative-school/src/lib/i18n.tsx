import { useEffect, useState } from 'react';
import { kk } from './kk-dict';

// Переводчик интерфейса: находит русские тексты на странице и подставляет казахские из kk-dict.ts.
type Lang = 'ru' | 'kk';
const KEY = 'cs-lang';
const textState = new WeakMap<Text, { src: string; out: string }>();
let lang: Lang = 'ru';
let started = false;
const listeners = new Set<(l: Lang) => void>();

function trText(n: Text) {
  const st = textState.get(n), raw = n.nodeValue ?? '';
  if (st && raw === st.out) return;
  const src = raw, key = src.trim(), val = lang === 'kk' ? kk[key] : undefined;
  if (!val) { textState.delete(n); return; }
  const out = src.replace(key, val);
  textState.set(n, { src, out });
  n.nodeValue = out;
}
function trAttrs(el: Element) {
  for (const a of ['placeholder', 'aria-label'] as const) {
    const cur = el.getAttribute(a); if (cur === null) continue;
    const ds = `i18n${a === 'placeholder' ? 'Ph' : 'Aria'}`, h = el as HTMLElement;
    const src = h.dataset[ds] ?? cur;
    const val = lang === 'kk' ? kk[src.trim()] : undefined;
    if (val) { h.dataset[ds] = src; if (cur !== val) el.setAttribute(a, val); }
    else if (h.dataset[ds] !== undefined && cur === kk[h.dataset[ds]!.trim()]) { el.setAttribute(a, h.dataset[ds]!); delete h.dataset[ds]; }
  }
}
function walk(root: Node) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n as Text;
    if (lang === 'ru') { const st = textState.get(t); if (st && t.nodeValue === st.out) { t.nodeValue = st.src; textState.delete(t); } } else trText(t);
  }
  if (root instanceof Element) { trAttrs(root); root.querySelectorAll('[placeholder],[aria-label]').forEach(trAttrs); }
}
function start() {
  if (started) return; started = true;
  lang = (localStorage.getItem(KEY) as Lang) === 'kk' ? 'kk' : 'ru';
  document.documentElement.lang = lang;
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === 'characterData' && m.target instanceof Text) { if (lang === 'kk') trText(m.target); }
      else if (m.type === 'attributes' && m.target instanceof Element) trAttrs(m.target);
      else m.addedNodes.forEach((n) => { if (n.nodeType === 1 || n.nodeType === 3) walk(n.nodeType === 3 ? n.parentNode ?? n : n); });
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label'] });
  walk(document.body);
}
function setLang(l: Lang) {
  lang = l; localStorage.setItem(KEY, l); document.documentElement.lang = l;
  walk(document.body); listeners.forEach((f) => f(l));
}

export function LangToggle() {
  const [cur, setCur] = useState<Lang>('ru');
  useEffect(() => { try { start(); } catch { /* storage недоступен */ } setCur(lang); listeners.add(setCur); return () => { listeners.delete(setCur); }; }, []);
  const b = (l: Lang, label: string) => <button onClick={() => setLang(l)} className={`px-3 py-1.5 text-[11px] font-semibold ${cur === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>;
  return <div data-no-i18n className="fixed bottom-4 right-4 z-[60] flex overflow-hidden rounded-full border border-border bg-card shadow-lg">{b('ru', 'RU')}{b('kk', 'ҚАЗ')}</div>;
}
