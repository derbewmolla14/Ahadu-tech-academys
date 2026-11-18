import { apiFetch } from '../api/api';

export async function downloadApprovedResource(resource, requestAccess) {
  if (!resource?.downloadEndpoint) {
    requestAccess?.(resource);
    return;
  }

  // A catalog can already tell us that a Premium resource is locked.
  // Open the payment instructions immediately instead of starting a download request.
  if (resource.hasAccess === false || resource.isApproved === false) {
    requestAccess?.({
      ...resource,
      accessType: resource.accessType || (resource.isPremium ? 'premium' : undefined),
    });
    return;
  }

  try {
    const response = await apiFetch(resource.downloadEndpoint, { cache: 'no-store' });
    if (response.status === 403) {
      requestAccess?.({
        ...resource,
        accessType: resource.accessType || (resource.isPremium ? 'premium' : undefined),
      });
      return;
    }
    if (response.status === 401) {
      throw new Error('Please sign in again before downloading this resource.');
    }
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || 'Unable to download this resource.');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const fileName = String(resource.fileName || resource.originalFileName || resource.title || 'learning-resource')
      .replace(/[\\/:*?"<>|]+/g, '-');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch (error) {
    window.alert(error.message || 'Unable to download this resource.');
  }
}
