import nodemailer from 'nodemailer'
import { submissionNotificationTemplate, statusUpdateTemplate, digestTemplate } from './email-templates'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@mcpservers.org',
    to,
    subject,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export async function sendSubmissionNotification(submission: {
  name: string
  email: string
  description: string
  url: string
  category: string
  premium: boolean
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@mcpservers.org',
      to: adminEmail,
      subject: `Новая отправка MCP-сервера: ${submission.name}`,
      html: submissionNotificationTemplate(submission),
    })
    console.log('Email notification sent successfully')
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}

export async function sendStatusUpdateNotification(submission: {
  name: string
  email: string
  status: string
}) {
  const statusText = submission.status === 'approved' ? 'одобрена' : 'отклонена'

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@mcpservers.org',
      to: submission.email,
      subject: `Ваша отправка MCP-сервера ${submission.name} ${statusText}`,
      html: statusUpdateTemplate(submission),
    })
    console.log('Status update email sent successfully')
  } catch (error) {
    console.error('Failed to send status update email:', error)
  }
}

export async function sendDigestEmail(
  to: string,
  categoryTitle: string,
  servers: Array<{ name: string; description: string }>
) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@mcpservers.org',
      to,
      subject: `Еженедельный дайджест MCP серверов${categoryTitle}`,
      html: digestTemplate(categoryTitle, servers),
    })
    console.log('Digest email sent to', to)
  } catch (error) {
    console.error('Failed to send digest email:', error)
  }
}
