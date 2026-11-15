/** One owner per editor; disposal rejects callers and terminates owned resources. */
export class WorkerRpc {
  private serial = 0;
  private disposed = false;
  private pending = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (reason: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  constructor(private readonly worker: Worker) {
    worker.onmessage = ({ data }) => {
      const job = this.pending.get(data.id);
      if (!job) {
        data.bitmap?.close();
        return;
      }
      clearTimeout(job.timer);
      this.pending.delete(data.id);
      data.error ? job.reject(Error(data.error)) : job.resolve(data);
    };
    worker.onerror = () => this.dispose(Error("WORKER_FAILED"));
    worker.onmessageerror = () => this.dispose(Error("WORKER_MESSAGE"));
  }
  request<T>(
    message: Record<string, unknown>,
    transfer: Transferable[] = [],
  ): Promise<T> {
    if (this.disposed) return Promise.reject(Error("WORKER_DISPOSED"));
    const id = ++this.serial;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(Error("WORKER_TIMEOUT"));
      }, 60000);
      this.pending.set(id, { resolve, reject, timer });
      try {
        this.worker.postMessage({ ...message, id }, transfer);
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(e);
      }
    });
  }
  dispose(reason = Error("WORKER_DISPOSED")) {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.terminate();
    for (const job of this.pending.values()) {
      clearTimeout(job.timer);
      job.reject(reason);
    }
    this.pending.clear();
  }
}
