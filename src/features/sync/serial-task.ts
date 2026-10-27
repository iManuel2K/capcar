/** Keep snapshot writes in order so an older request cannot overwrite a newer save. */
export function createSerialTask() {
  let pending: Promise<unknown> = Promise.resolve();
  return function run<T>(task: () => Promise<T>): Promise<T> {
    const next = pending.then(task, task);
    pending = next.catch(() => undefined);
    return next;
  };
}
