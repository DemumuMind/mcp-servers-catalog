function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 24px; }
    a { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td, th { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background: #f3f3f3; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin:0;font-size:20px;">Awesome MCP Servers</h1>
  </div>
  <div class="content">
    <h2>${title}</h2>
    ${content}
  </div>
  <div class="footer">
    <p>Это автоматическое сообщение от <a href="https://mcpservers.org">mcpservers.org</a></p>
    <p>Вы получили это письмо, потому что связаны с нашим каталогом MCP серверов.</p>
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
}): string {
  return emailTemplate(
    'Новая отправка MCP-сервера',
    `
    <table>
      <tr><th>Название</th><td>${escapeHtml(submission.name)}</td></tr>
      <tr><th>Email</th><td>${escapeHtml(submission.email)}</td></tr>
      <tr><th>Описание</th><td>${escapeHtml(submission.description)}</td></tr>
      <tr><th>URL</th><td><a href="${escapeHtml(submission.url)}">${escapeHtml(submission.url)}</a></td></tr>
      <tr><th>Категория</th><td>${escapeHtml(submission.category)}</td></tr>
      <tr><th>Premium</th><td>${submission.premium ? '✅ Да' : '❌ Нет'}</td></tr>
    </table>
    <p><a href="${process.env.NEXTAUTH_URL}/admin/submissions" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;margin-top:12px;">Перейти в админку</a></p>
    `
  )
}

export function statusUpdateTemplate(submission: {
  name: string
  status: string
}): string {
  const statusText = submission.status === 'approved' ? 'одобрена' : 'отклонена'
  return emailTemplate(
    `Ваша отправка ${submission.name} ${statusText}`,
    `
    <p>Ваша отправка сервера <strong>${escapeHtml(submission.name)}</strong> была <strong>${statusText}</strong>.</p>
    <p>Спасибо за участие в развитии экосистемы MCP!</p>
    `
  )
}

export function digestTemplate(categoryTitle: string, servers: Array<{ name: string; description: string }>): string {
  return emailTemplate(
    `Еженедельный дайджест MCP серверов${categoryTitle}`,
    `
    <p>Новые MCP серверы за неделю${categoryTitle}:</p>
    <ul>
      ${servers.map((s) => `<li><strong>${escapeHtml(s.name)}</strong>: ${escapeHtml(s.description)}</li>`).join('')}
    </ul>
    <p><a href="https://mcpservers.org/ru/all" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;margin-top:12px;">Посмотреть все серверы →</a></p>
    `
  )
}
