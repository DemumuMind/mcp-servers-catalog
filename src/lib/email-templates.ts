import { BRAND_NAME, miniBrandMarkSvg } from '@/lib/brand-svg'

const SITE_URL = process.env.SITE_URL || 'https://mcpservers.org'

type Locale = 'ru' | 'en'

const strings = {
  ru: {
    htmlLang: 'ru',
    footerAutoMessage: 'Это автоматическое сообщение от',
    footerReason: 'Вы получили это письмо, потому что связаны с нашим каталогом MCP серверов.',
    newSubmission: 'Новая отправка MCP-сервера',
    name: 'Название',
    description: 'Описание',
    category: 'Категория',
    premiumYes: '✅ Да',
    premiumNo: '❌ Нет',
    goToAdmin: 'Перейти в админку',
    approved: 'одобрена',
    rejected: 'отклонена',
    yourSubmissionStatus: 'Ваша отправка сервера {name} была {status}.',
    yourSubmissionTitle: 'Ваша отправка {name} {status}',
    thanksForContributing: 'Спасибо за участие в развитии экосистемы MCP!',
    weeklyDigest: 'Еженедельный дайджест MCP серверов{categoryTitle}',
    newServersThisWeek: 'Новые MCP серверы за неделю{categoryTitle}:',
    viewAllServers: 'Посмотреть все серверы →',
  },
  en: {
    htmlLang: 'en',
    footerAutoMessage: 'This is an automated message from',
    footerReason: 'You received this email because you are associated with our MCP servers catalog.',
    newSubmission: 'New MCP Server Submission',
    name: 'Name',
    description: 'Description',
    category: 'Category',
    premiumYes: '✅ Yes',
    premiumNo: '❌ No',
    goToAdmin: 'Go to Admin Panel',
    approved: 'approved',
    rejected: 'rejected',
    yourSubmissionStatus: 'Your submission of server <strong>{name}</strong> has been <strong>{status}</strong>.',
    yourSubmissionTitle: 'Your submission {name} {status}',
    thanksForContributing: 'Thank you for contributing to the MCP ecosystem!',
    weeklyDigest: 'Weekly MCP Servers Digest{categoryTitle}',
    newServersThisWeek: 'New MCP servers this week{categoryTitle}:',
    viewAllServers: 'View all servers →',
  },
} as const

function t(locale: Locale) {
  return strings[locale] ?? strings.ru
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailTemplate(title: string, content: string, locale: Locale = 'ru'): string {
  const sub = t(locale)
  const brandMark = miniBrandMarkSvg()

  return `<!DOCTYPE html>
<html lang="${sub.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2f2419; max-width: 600px; margin: 0 auto; padding: 20px; background:#f8f1e1; }
    .header { background: linear-gradient(135deg, #2a1b10, #7a4e1a 62%, #1c130c); color: #fff6e5; padding: 22px; text-align: center; border-radius: 18px 18px 0 0; }
    .brand { display: inline-flex; align-items: center; gap: 10px; }
    .brand-mark { display: inline-block; width: 36px; height: 36px; line-height: 0; vertical-align: middle; }
    .brand-mark svg { display: block; width: 36px; height: 36px; }
    .content { background: #fffaf0; padding: 24px; border: 1px solid #eadcc4; border-top: 0; border-radius: 0 0 18px 18px; }
    .footer { text-align: center; color: #776651; font-size: 12px; margin-top: 24px; }
    a { color: #8a5a20; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td, th { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background: #f3f3f3; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">${brandMark}</span>
      <h1 style="margin:0;font-size:20px;">${BRAND_NAME}</h1>
    </div>
  </div>
  <div class="content">
    <h2>${title}</h2>
    ${content}
  </div>
  <div class="footer">
    <p>${sub.footerAutoMessage} <a href="${SITE_URL}">mcpservers.org</a></p>
    <p>${sub.footerReason}</p>
  </div>
</body>
</html>`
}

export function submissionNotificationTemplate(submission: {
  name: string
  email: string
  description: string
  url: string
  category: string
  premium: boolean
}, locale: Locale = 'ru'): string {
  const sub = t(locale)
  return emailTemplate(
    sub.newSubmission,
    `
    <table>
      <tr><th>${sub.name}</th><td>${escapeHtml(submission.name)}</td></tr>
      <tr><th>Email</th><td>${escapeHtml(submission.email)}</td></tr>
      <tr><th>${sub.description}</th><td>${escapeHtml(submission.description)}</td></tr>
      <tr><th>URL</th><td><a href="${escapeHtml(submission.url)}">${escapeHtml(submission.url)}</a></td></tr>
      <tr><th>${sub.category}</th><td>${escapeHtml(submission.category)}</td></tr>
      <tr><th>Premium</th><td>${submission.premium ? sub.premiumYes : sub.premiumNo}</td></tr>
    </table>
    <p><a href="${process.env.NEXTAUTH_URL}/admin/submissions" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;margin-top:12px;">${sub.goToAdmin}</a></p>
    `,
    locale
  )
}

/** Locale-aware category title fragment for digest emails */
export function digestCategoryTitle(category: string | null | undefined, locale: Locale): string {
  if (!category) return ''
  // We need to match the pattern used in subject strings: " категории \"X\"" (ru) / " in category \"X\"" (en)
  const categoryStrings = {
    ru: ` категории "${category}"`,
    en: ` in category "${category}"`,
  } as const
  return categoryStrings[locale] ?? categoryStrings.ru
}

export function statusUpdateTemplate(submission: {
  name: string
  status: string
}, locale: Locale = 'ru'): string {
  const sub = t(locale)
  const statusText = submission.status === 'approved' ? sub.approved : sub.rejected
  const safeName = submission.name.replace(/[\r\n]/g, ' ')

  const title = sub.yourSubmissionTitle
    .replace('{name}', safeName)
    .replace('{status}', statusText)

  const bodyContent = sub.yourSubmissionStatus
    .replace('{name}', escapeHtml(submission.name))
    .replace('{status}', statusText)

  return emailTemplate(
    title,
    `
    <p>${bodyContent}</p>
    <p>${sub.thanksForContributing}</p>
    `,
    locale
  )
}

export function digestTemplate(categoryTitle: string, servers: Array<{ name: string; description: string }>, locale: Locale = 'ru'): string {
  const sub = t(locale)
  const localePath = locale === 'ru' ? '/ru' : '/en'
  return emailTemplate(
    sub.weeklyDigest.replace('{categoryTitle}', categoryTitle),
    `
    <p>${sub.newServersThisWeek.replace('{categoryTitle}', categoryTitle)}</p>
    <ul>
      ${servers.map((s2) => `<li><strong>${escapeHtml(s2.name)}</strong>: ${escapeHtml(s2.description)}</li>`).join('')}
    </ul>
    <p><a href="${SITE_URL}${localePath}/all" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;margin-top:12px;">${sub.viewAllServers}</a></p>
    `,
    locale
  )
}
