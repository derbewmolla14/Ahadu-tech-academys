const DB = 'ahadu-tech-offline';
const STORE = 'resources';
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneed = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
const req = (r) => new Promise((resolve, reject) => {
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});
const keyOf = (url = '') => String(url).replace(/^\//, '').split('?')[0].split('#')[0];
export async function saveOfflineResource({ endpoint, blob, ...metadata }) {
  const key = keyOf(endpoint) || `offline-${Date.now()}`;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ...metadata, id: key, sourceEndpoint: key, localBlobKey: key, blob, mimeType: blob.type || metadata.mimeType, fileSize: blob.size, downloadedAt: new Date().toISOString() });
    await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
  } finally { db.close(); }
}
export async function listOfflineResources() {
  const db = await openDb();
  try { return await req(db.transaction(STORE).objectStore(STORE).getAll()); }
  finally { db.close(); }
}
export async function getOfflineResource(id) {
  const db = await openDb();
  try { return await req(db.transaction(STORE).objectStore(STORE).get(id)); }
  finally { db.close(); }
}
export async function findOfflineResourceByEndpoint(url) {
  const key = keyOf(url);
  const all = await listOfflineResources();
  return all.find((item) => item.sourceEndpoint === key) || null;
}
export async function deleteOfflineResource(id) {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
  } finally { db.close(); }
}
export function createOfflineObjectUrl(item) {
  return item?.blob ? URL.createObjectURL(item.blob) : '';
}
