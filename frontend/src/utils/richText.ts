import DOMPurify from 'dompurify'

function isHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function plainTextToHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return escaped
    .split('\n')
    .map((line) => `<p>${line}</p>`)
    .join('')
}

export function toHtml(value: string): string {
  return isHtml(value) ? value : plainTextToHtml(value)
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}

export function htmlToText(value: string): string {
  const spaced = toHtml(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|h[1-6]|div)>/gi, '$& ')

  const doc = new DOMParser().parseFromString(sanitizeHtml(spaced), 'text/html')

  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}