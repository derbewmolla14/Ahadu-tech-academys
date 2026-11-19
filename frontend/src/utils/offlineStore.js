const DB_NAME = 'ahadu-tech-offline';
const DB_VERSION = 1;
const STORE = 'resources';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open offline storage.'));
  });
}

function requestValue(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Offline storage request failed.'));
  });
}

function keyOf(url = '') {
  return String(url).replace(/^\\//, '').split('?')[0].split('#')[0];
}

export async function saveOfflineResource({ endpoint, blob, ...metadata }) {
  if (!(blob instanceof Blob)) throw new Error('A valid file is required.');
  const id = keyOf(endpoint) || `offline-${Date.now()}`;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({
      ...metadata, id, sourceEndpoint: id, localBlobKey: id, blob,
      mimeType: blob.type || metadata.mimeType || 'application/octet-stream',
      fileSize: blob.size, downloadedAt: new Date().toISOString(),
    });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Could not save this lesson.'));
      tx.onabort = () => reject(tx.error || new Error('Offline save was cancelled.'));
    });
  } finally {
    db.close();
  }
}

export async function listOfflineResources() {
  const db = await openDb();
  try {
    return await requestValue(db.transaction(STORE, 'readonly').objectStore(STORE).getAll());
  } finally {
    db.close();
  }
}

export async function getOfflineResource(id) {
  const db = await openDb();
  try {
    return (await requestValue(db.transaction(STORE, 'readonly').objectStore(STORE).get(id))) || null;
  } finally {
    db.close();
  }
}

export async function findOfflineResourceByEndpoint(endpoint) {
  const key = keyOf(endpoint);
  const items = await listOfflineResources();
  return items.find((item) => item.sourceEndpoint === key) || null;
}

export async function deleteOfflineResource(id) {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Could not delete this lesson.'));
      tx.onabort = () => reject(tx.error || new Error('Delete was cancelled.'));
    });
  } finally {
    db.close();
  }
}

export function createOfflineObjectUrl(item) {
  return item?.blob ? URL.createObjectURL(item.blob) : '';
}
