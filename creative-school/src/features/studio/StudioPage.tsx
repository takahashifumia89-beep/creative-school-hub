import { useEffect, useState } from 'react';
import { Box, Layers3 } from 'lucide-react';
import { PageIntro } from '@/features/shared/PageIntro';
import { createProject, getCurrentUser, getProject, updateProject } from '@/lib/api';
import { DesignEditor, emptyDesign, type DesignDoc } from './DesignEditor';
import { Editor3D, emptyScene, type SceneDoc } from './Editor3D';

function parse<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

export function StudioPage({ kind, onToast }: { kind: 'design' | '3d'; onToast: (text: string) => void }) {
  const is3d = kind === '3d';
  const [projectId, setProjectId] = useState<string | null>(() => new URLSearchParams(window.location.search).get('project'));
  const [loaded, setLoaded] = useState(!projectId);
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [design, setDesign] = useState<DesignDoc>(emptyDesign);
  const [scene, setScene] = useState<SceneDoc>(emptyScene);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    void getProject(projectId).then((r) => {
      if (r.data) {
        setTitle(r.data.title);
        setBrief(r.data.description ?? '');
        if (is3d) setScene(parse(r.data.content, emptyScene)); else setDesign(parse(r.data.content, emptyDesign));
      } else onToast(r.error ?? 'Проект не найден.');
      setLoaded(true);
    });
  }, []);

  async function save() {
    if (!title.trim()) { onToast('Сначала укажите название проекта.'); return; }
    setSaving(true);
    const values = { title: title.trim(), description: brief.trim() || null, content: JSON.stringify(is3d ? scene : design) };
    let error: string | null = null;
    if (projectId) {
      error = (await updateProject(projectId, values)).error;
    } else {
      const { user } = await getCurrentUser();
      if (!user) error = 'Войдите, чтобы сохранить проект.';
      else {
        const r = await createProject(user.id, { ...values, category: is3d ? '3D и моделирование' : 'Дизайн' });
        error = r.error;
        if (r.data) { setProjectId(r.data.id); window.history.replaceState(null, '', `${window.location.pathname}?project=${r.data.id}`); }
      }
    }
    setSaving(false);
    onToast(error ?? 'Сохранено как черновик. Опубликовать можно в разделе «Проекты».');
  }

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro eyebrow={is3d ? 'Творческая студия' : 'Рабочая область'} title={is3d ? '3D-студия.' : 'Дизайн-студия.'}
        description={is3d ? 'Собирайте сцену из объектов, двигайте и красьте их, затем сохраните в проекты.' : 'Рисуйте фигурами и текстом на холсте, затем сохраняйте в проекты или скачивайте SVG.'} />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          {!loaded ? <p className="p-8 text-center text-sm text-muted-foreground">Загружаем проект…</p>
            : is3d ? <Editor3D value={scene} onChange={setScene} /> : <DesignEditor value={design} onChange={setDesign} />}
        </section>
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">{is3d ? <Box size={14} /> : <Layers3 size={14} />}{projectId ? 'Редактирование' : 'Новый проект'}</div>
          <label className="mt-5 block text-xs font-medium">Название проекта<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, «Тихий свет»" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label>
          <label className="mt-4 block text-xs font-medium">Идея и заметки<textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Что вы хотите создать?" rows={5} className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" /></label>
          <button disabled={saving || !loaded} onClick={() => void save()} className="mt-5 w-full rounded-lg bg-primary py-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">{saving ? 'Сохраняем…' : 'Сохранить'}</button>
          {projectId && <button onClick={() => window.location.assign(`/studio/${kind}`)} className="mt-2 w-full rounded-lg border border-border py-3 text-xs font-semibold">Новый проект</button>}
        </aside>
      </div>
    </div>
  );
}
