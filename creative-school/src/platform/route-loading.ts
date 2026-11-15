export const loadSpark = () => import("./SparkPage");
export const loadDashboard = () => import("@/features/dashboard/DashboardPage");
export const loadProjects = () => import("@/features/projects/ProjectsPage");
export const loadPortfolio = () => import("@/features/projects/PortfolioPage");
export const loadLearning = () => import("./Learning");
export const loadStudio = () => import("./Studio");
export const loadMarket = () => import("./ServiceMarketplace");
const started = new Set<string>();
export function prefetchRoute(path: string) {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (
    connection?.saveData ||
    connection?.effectiveType?.includes("2g") ||
    started.has(path)
  )
    return;
  started.add(path);
  let promise: Promise<unknown> | undefined;
  if (path.startsWith("/spark")) promise = loadSpark();
  else if (path.startsWith("/learn")) promise = loadLearning();
  else if (path.startsWith("/dashboard")) promise = loadDashboard();
  else if (path.startsWith("/projects")) promise = loadProjects();
  else if (path.startsWith("/portfolio")) promise = loadPortfolio();
  else if (path.startsWith("/marketplace")) promise = loadMarket();
  else if (path.startsWith("/studio/"))
    promise = Promise.all([
      loadStudio(),
      path.startsWith("/studio/3d")
        ? import("@/features/studio/Editor3D")
        : path.startsWith("/studio/design")
          ? import("@/features/studio/DesignEditor")
          : import("./MediaEditor"),
    ]);
  void promise?.catch(() => started.delete(path));
}
