import nodemailer from 'nodemailer'
import { submissionNotificationTemplate, statusUpdateTemplate, digestTemplate } from './email-templates'

type Locale = 'ru' | 'en'

let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    })
  }
  return _transporter
}

export function resetTransporter(): void {
  _transporter = null
}

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@mcpservers.org',
    to,
    subject,
    html,
  }

  try {
    await getTransporter().sendMail(mailOptions)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

const subjectStrings = {
  ru: {
    newSubmission: 'Новая отправка MCP-сервера: {name}',
    yourSubmissionStatus: 'Ваша отправка MCP-сервера {name} {status}',
    weeklyDigest: 'Еженедельный дайджест MCP серверов{categoryTitle}',
    approved: 'одобрена',
    rejected: 'отклонена',
  },
  en: {
    newSubmission: 'New MCP Server Submission: {name}',
    yourSubmissionStatus: 'Your MCP server submission {name} {status}',
    weeklyDigest: 'Weekly MCP Servers Digest{categoryTitle}',
    approved: 'approved',
    rejected: 'rejected',
  },
} as const

function subjectT(locale: Locale) {
  return subjectStrings[locale] ?? subjectStrings.ru
}

export async function sendSubmissionNotification(submission: {
  name: string
  email: string
  description: string
  url: string
  category: string
  premium: boolean
}, locale: Locale = 'ru') {
  const s = subjectT(locale)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const safeName = submission.name.replace(/[\r\n]/g, ' ')

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_USER || 'noreply@mcpservers.org',
      to: adminEmail,
      subject: s.newSubmission.replace('{name}', safeName),
      html: submissionNotificationTemplate(submission, locale),
    })
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}

export async function sendStatusUpdateNotification(submission: {
  name: string
  email: string
  status: string
}, locale: Locale = 'ru') {
  const s = subjectT(locale)
  const statusText = submission.status === 'approved' ? s.approved : s.rejected
  const safeName = submission.name.replace(/[\r\n]/g, ' ')

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_USER || 'noreply@mcpservers.org',
      to: submission.email,
      subject: s.yourSubmissionStatus.replace('{name}', safeName).replace('{status}', statusText),
      html: statusUpdateTemplate(submission, locale),
    })
  } catch (error) {
    console.error('Failed to send status update email:', error)
  }
}

export async function sendDigestEmail(
  to: string,
  categoryTitle: string,
  servers: Array<{ name: string; description: string }>,
  locale: Locale = 'ru'
) {
  const s = subjectT(locale)
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_USER || 'noreply@mcpservers.org',
      to,
      subject: s.weeklyDigest.replace('{categoryTitle}', categoryTitle),
      html: digestTemplate(categoryTitle, servers, locale),
    })
  } catch (error) {
    console.error('Failed to send digest email:', error)
  }
}
