import { apiFetch } from '../api/api';
import { saveOfflineResource } from './offlineStore';

function metadataFor(resource, blob) {
  const endpoint = String(resource.downloadEndpoint || '').split('?')[0].replace(/^\//, '');
  const video = endpoint.match(/^content\/([^/]+)\/video\/([^/]+)/);
  const material = endpoint.match(/^content\/([^/]+)\/material\/([^/]+)\/([^/]+)/);
  const type = String(resource.type || '').toLowerCase();
  const name = String(resource.fileName || resource.originalFileName || resource.title || 'learning-resource').replace(/[\\/:*?"<>|]+/g, '-');
  const fileType = type.includes('video') || blob.type.startsWith('video/') ? 'video'
    : type.includes('ppt') || type.includes('presentation') || /\.pptx?$/i.test(name) ? 'ppt' : 'pdf';
  return {
    title: resource.title || name, fileName: name, fileType,
    courseId: video?.[1] || material?.[1] || resource.courseId || '',
    lessonId: video ? `video-${video[2]}` : material ? `${material[2]}-${material[3]}` : resource.lessonId || '',
    accessType: resource.accessType || (resource.isPremium ? 'premium' : 'free'),
  };
}
export async function downloadApprovedResource(resource, requestAccess) {
  if (!resource?.downloadEndpoint) { requestAccess?.(resource); return; }
  if (resource.hasAccess === false || resource.isApproved === false) {
    requestAccess?.({ ...resource, accessType: resource.accessType || (resource.isPremium ? 'premium' : undefined) });
    return;
  }
  try {
    if (navigator.onLine === false) throw new Error('Connect to the internet to download this lesson. Saved lessons remain available offline.');
    // Authentication and Premium approval are checked by the existing backend before any file is stored.
    const response = await apiFetch(resource.downloadEndpoint, { cache: 'no-store' });
    if (response.status === 403) {
      requestAccess?.({ ...resource, accessType: resource.accessType || (resource.isPremium ? 'premium' : undefined) });
      return;
    }
    if (response.status === 401) throw new Error('Please sign in again before downloading this resource.');
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || 'Unable to save this resource.');
    }
    const blob = await response.blob();
    await saveOfflineResource({ endpoint: resource.downloadEndpoint, blob, ...metadataFor(resource, blob), mimeType: blob.type });
    window.dispatchEvent(new CustomEvent('ahadu:offline-library-updated'));
    window.alert('Saved to My Offline Library on this device.');
  } catch (error) { window.alert(error.message || 'Unable to save this resource.'); }
}
