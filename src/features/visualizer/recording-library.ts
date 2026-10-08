export type Recording = {
  id: string;
  name: string;
  vehicle: string;
  category: "engine" | "exhaust" | "intake" | "cold-start";
  setup: "stock" | "modified";
  rights: "owned" | "permission";
  createdAt: string;
  file: Blob;
};

export class RecordingLimitError extends Error {
  constructor() {
    super("The local library holds up to 20 recordings.");
  }
}

/** Check capacity inside the write transaction, so two tabs cannot race it. */
export async function saveRecording(recording: Recording): Promise<void> {
  let full = false;
  try {
    await recordingStore((store) => {
      const count = store.count();
      count.onsuccess = () => {
        if (count.result >= 20) {
          full = true;
          store.transaction.abort();
        } else store.add(recording);
      };
      return count;
    }, true);
  } catch (error) {
    if (full) throw new RecordingLimitError();
    throw error;
  }
}

export async function recordingStore<T>(
  operation: (store: IDBObjectStore) => IDBRequest<T>,
  write = false,
): Promise<T> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    let blocked = false;
    const request = indexedDB.open("capcar-recording-library", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("recordings", { keyPath: "id" });
    request.onsuccess = () => {
      if (blocked) {
        request.result.close();
        return;
      }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () =>
      reject(new Error("Recording storage is unavailable."));
    request.onblocked = () => {
      blocked = true;
      reject(new Error("Close other CapCar tabs and retry."));
    };
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(
        "recordings",
        write ? "readwrite" : "readonly",
      );
      const request = operation(transaction.objectStore("recordings"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = transaction.onabort = () =>
        reject(
          new Error("Could not save recordings. Browser storage may be full."),
        );
    });
  } finally {
    db.close();
  }
}
