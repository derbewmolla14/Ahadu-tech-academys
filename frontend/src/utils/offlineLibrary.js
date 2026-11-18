const DB_NAME = 'ahadu-offline-library';
const DB_VERSION = 1;
const STORE_NAME = 'resources';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('Offline storage is not supported on this device.'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('savedAt', 'savedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open offline storage.'));
  });
}

async function withStore(mode, action) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    let result;
    try { result = action(store); } catch (error) { db.close(); reject(error); return; }
    tx.oncomplete = () => { db.close(); resolve(result?.result ?? result); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('Offline storage failed.')); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('Offline storage was interrupted.')); };
  });
}

export async function saveOfflineResource({ blob, title, fileName, mimeType, resourceId, resourceType }) {
  if (!(blob instanceof Blob) || blob.size === 0) throw new Error('The downloaded file is empty.');
  const record = {
    id: `${resourceId || 'resource'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    resourceId: resourceId || null,
    title: title || fileName || 'Learning resource',
    fileName: fileName || title || 'learning-resource',
    mimeType: mimeType || blob.type || 'application/octet-stream',
    resourceType: resourceType || 'document',
    size: blob.size,
    savedAt: new Date().toISOString(),
    blob,
  };
  await withStore('readwrite', (store) => store.put(record));
  return { ...record, blob: undefined };
}

export async function listOfflineResources() {
  const records = await withStore('readonly', (store) => store.getAll());
  return (records || []).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export async function getOfflineResource(id) {
  return withStore('readonly', (store) => store.get(id));
}

export async function deleteOfflineResource(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
