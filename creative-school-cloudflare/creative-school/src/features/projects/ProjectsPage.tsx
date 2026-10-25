import { useEffect, useState } from 'react';
import { FolderKanban, LoaderCircle, Plus, Upload, X } from 'lucide-react';
import { PageIntro } from '@/features/shared/PageIntro';
import { getCurrentUser, type Project } from '@/lib/api';
import { createProject, fetchProjects, updateProject } from '@/lib/api';

export function ProjectsPage({ onToast }: { onToast: (text: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void getCurrentUser().then(async ({ user }) => {
      if (!user) return;
      const result = await fetchProjects(user.id);
      setProjects(result.data);
      if (result.error) setError(result.error);
    });
  }, []);

  async function save() {
    if (!title.trim()) return;
    setPending(true);
    const { user } = await getCurrentUser();
    const result = user
      ? await createProject(user.id, {
          title: title.trim(),
          description: description.trim() || null,
          category: 'Творческая практика',
        })
      : { data: null, error: 'Сессия завершилась. Войдите ещё раз.' };
    setPending(false);
    if (result.error || !result.data) {
      setError(result.error ?? 'Не удалось создать проект.');
      return;
    }
    setProjects((current) => [result.data as Project, ...current]);
    setTitle('');
    setDescription('');
    setShowForm(false);
    onToast('Проект сохранён на этом устройстве.');
  }

  async function publish(project: Project) {
    const result = await updateProject(project.id, { status: 'published', visibility: 'public' });
    if (result.error || !result.data) {
      onToast(result.error ?? 'Не удалось опубликовать проект.');
      return;
    }
    setProjects((current) => current.map((item) => item.id === project.id ? result.data as Project : item));
    onToast('Проект опубликован в портфолио.');
  }

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro
        eyebrow="Ваши работы"
        title="Проекты."
        description="Храните здесь эксперименты и черновики, а готовые работы публикуйте в портфолио."
        action={<button onClick={() => setShowForm((value) => !value)} className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"><Plus className="mr-2 inline" size={14} /> Новый проект</button>}
      />
      {showForm && (
        <div className="mb-6 rounded-2xl border border-primary/50 bg-primary/5 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><div className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">Новый проект</div><h2 className="mt-1 font-display text-2xl tracking-[-.05em]">Дайте идее пространство.</h2></div>
            <button onClick={() => setShowForm(false)} aria-label="Закрыть форму" className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X size={17} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium">Название проекта<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Название вашей идеи" className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" /></label>
            <label className="text-xs font-medium">Краткое описание<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Во что это может вырасти?" rows={2} className="mt-2 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" /></label>
          </div>
          <div className="mt-5 flex justify-end"><button disabled={pending || !title.trim()} onClick={() => void save()} className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">{pending && <LoaderCircle className="mr-2 inline animate-spin" size={14} />}Сохранить проект</button></div>
        </div>
      )}
      {error && <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">{error}</div>}
      {projects.length === 0 && !error ? (
        <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div><FolderKanban className="mx-auto text-primary" size={22} /><h2 className="mt-5 font-display text-2xl tracking-[-.05em]">Создайте свой первый проект.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Сохраните идею как черновик, а когда она будет готова — опубликуйте в портфолио. Данные останутся в браузере этого устройства.</p></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <article key={project.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className={`relative h-52 overflow-hidden ${index % 3 === 0 ? 'bg-secondary/60' : index % 3 === 1 ? 'bg-accent/55' : 'bg-primary/55'}`}><div className="absolute inset-5 border border-foreground/20" /><span className="absolute left-5 top-5 rounded-full bg-background/70 px-2 py-1 font-mono-ui text-[9px] uppercase">{project.visibility === 'public' ? 'Открытый' : project.visibility === 'private' ? 'Личный' : 'По ссылке'}</span><span className="absolute bottom-5 left-5 font-mono-ui text-[10px] uppercase tracking-widest opacity-70">Проект / 0{index + 1}</span></div>
              <div className="p-5"><h2 className="font-display text-2xl leading-[.95] tracking-[-.05em]">{project.title}</h2><p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description || 'Описания пока нет.'}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">{project.status === 'published' ? 'Опубликован' : 'Черновик'}</span>{project.status !== 'published' && <button onClick={() => void publish(project)} aria-label="Опубликовать проект" className="rounded-md p-2 text-primary hover:bg-primary/15"><Upload size={14} /></button>}</div></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
