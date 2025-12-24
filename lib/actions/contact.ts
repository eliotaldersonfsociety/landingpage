'use server'

import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function sendContactEmail(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  if (!name || !email || !subject || !message) {
    return { error: 'All fields are required' }
  }

  try {
    if (!resend) {
      console.warn('Resend not configured. Skipping send.')
      return { success: true }
    }

    await resend.emails.send({
      from: 'Tienda Texas <support@tiendatexas.com>',
      to: ['rennyardiladev@gmail.com'],
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9333ea;">New Contact Form Submission</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #9333ea;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">
            This message was sent from the Tienda Texas contact form.
          </p>
        </div>
      `,
    })

    return { success: true }
  } catch (err) {
    console.error('Contact email error:', err)
    return { error: 'Failed to send message' }
  }
}