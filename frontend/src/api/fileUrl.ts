export function getFileUrl(path: string | null): string | undefined {
  if (!path) {
    return undefined
  }

  return `${import.meta.env.VITE_FILES_BASE_URL}${path}`
}