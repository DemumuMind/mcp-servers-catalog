import sanitizeHtml from 'sanitize-html'

const DEFAULT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
  allowedAttributes: {
    a: ['href'],
  },
  allowedSchemes: ['https', 'mailto'],
}

export function sanitizeUserHtml(input: string): string {
  return sanitizeHtml(input, DEFAULT_OPTIONS)
}
