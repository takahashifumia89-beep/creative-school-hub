/** Settings are immutable values; media buffers never belong in command history. */
export interface Command<T> {
  execute(): T;
  undo(): T;
  mergeWith(next: Command<T>): Command<T> | null;
}
export class SnapshotCommand<T> implements Command<T> {
  constructor(
    readonly before: T,
    readonly after: T,
    readonly mergeKey = "",
  ) {}
  execute() {
    return this.after;
  }
  undo() {
    return this.before;
  }
  mergeWith(next: Command<T>): Command<T> | null {
    return this.mergeKey &&
      next instanceof SnapshotCommand &&
      next.mergeKey === this.mergeKey
      ? new SnapshotCommand(this.before, next.after, this.mergeKey)
      : null;
  }
}
/** Fixed-capacity storage releases evicted references without copying an array. */
export class RingBuffer<T> {
  private readonly values: (T | undefined)[];
  private start = 0;
  length = 0;
  constructor(readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1)
      throw Error("HISTORY_CAPACITY");
    this.values = new Array<T | undefined>(capacity);
  }
  push(value: T) {
    if (this.length === this.capacity) {
      this.values[this.start] = value;
      this.start = (this.start + 1) % this.capacity;
    } else this.values[(this.start + this.length++) % this.capacity] = value;
  }
  pop(): T | undefined {
    if (!this.length) return;
    const i = (this.start + --this.length) % this.capacity,
      value = this.values[i];
    this.values[i] = undefined;
    return value;
  }
  clear() {
    this.values.fill(undefined);
    this.start = 0;
    this.length = 0;
  }
}
export class CommandHistory<T> {
  readonly past: RingBuffer<Command<T>>;
  readonly future: RingBuffer<Command<T>>;
  private before: T | null = null;
  value: T;
  constructor(
    value: T,
    capacity = 80,
    private readonly equal = (a: T, b: T) =>
      a === b || JSON.stringify(a) === JSON.stringify(b),
  ) {
    this.value = value;
    this.past = new RingBuffer(capacity);
    this.future = new RingBuffer(capacity);
  }
  get active() {
    return this.before !== null;
  }
  begin() {
    if (this.before === null) this.before = this.value;
  }
  update(value: T) {
    this.value = value;
  }
  end() {
    const before = this.before;
    this.before = null;
    if (before !== null && !this.equal(before, this.value)) {
      this.past.push(new SnapshotCommand(before, this.value));
      this.future.clear();
      return true;
    }
    return false;
  }
  commit(value: T) {
    this.end();
    if (this.equal(this.value, value)) return false;
    return this.execute(new SnapshotCommand(this.value, value));
  }
  execute(command: Command<T>) {
    this.value = command.execute();
    this.past.push(command);
    this.future.clear();
    return true;
  }
  cancel() {
    if (this.before !== null) this.value = this.before;
    this.before = null;
    return this.value;
  }
  undo() {
    this.end();
    const c = this.past.pop();
    if (c) {
      this.value = c.undo();
      this.future.push(c);
    }
    return this.value;
  }
  redo() {
    this.end();
    const c = this.future.pop();
    if (c) {
      this.value = c.execute();
      this.past.push(c);
    }
    return this.value;
  }
  reset(value: T) {
    this.before = null;
    this.value = value;
    this.past.clear();
    this.future.clear();
  }
}
