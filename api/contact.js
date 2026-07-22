import { sendEmail, readForm } from './_send.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    const data = await readForm(req);
    const { name = '', email = '', subject = '', message = '' } = data;
    if (!email || !message) return res.status(400).json({ error: 'missing fields' });
    await sendEmail({
      subject: `[adamtank.com contact] ${subject || '(no subject)'}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      replyTo: email,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to send' });
  }
}
