export function formatDate(value, options) {
  if (!value) {
    return "n/a";
  }

  return new Date(value).toLocaleString(undefined, options);
}

export function formatFileSize(size) {
  if (!Number.isFinite(size)) {
    return "n/a";
  }

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  const precision = currentSize >= 10 || unitIndex === 0 ? 0 : 1;
  return `${currentSize.toFixed(precision)} ${units[unitIndex]}`;
}
