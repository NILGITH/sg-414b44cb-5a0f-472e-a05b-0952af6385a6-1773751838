
import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend('re_4hwHKz5v_E8ew16Y94o5REb6FZ1dWPAk7');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, subject, html, text } = req.body;

    const data = await resend.emails.send({
      from: 'CAPEC <noreply@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
      text: text,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}
