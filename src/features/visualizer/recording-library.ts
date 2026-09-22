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

export async function recordingStore<T>(
  operation: (store: IDBObjectStore) => IDBRequest<T>,
  write = false,
): Promise<T> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("capcar-recording-library", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("recordings", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Recording storage is unavailable."));
    request.onblocked = () =>
      reject(new Error("Close other CapCar tabs and retry."));
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
