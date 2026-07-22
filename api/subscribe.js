import { sendEmail, readForm } from './_send.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    const { email = '' } = await readForm(req);
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'invalid email' });
    await sendEmail({
      subject: '[adamtank.com] New newsletter subscriber',
      text: `New subscriber from adamtank.com: ${email}`,
      replyTo: email,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed' });
  }
}
