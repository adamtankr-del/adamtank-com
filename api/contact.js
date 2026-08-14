import { sendEmail, readForm } from './_send.js';
import { screen, clientIp, HUMAN_FALLBACK } from './_guard.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    const data = await readForm(req);
    const { name = '', email = '', subject = '', message = '' } = data;
    if (!email || !message) return res.status(400).json({ error: 'Please fill in every field.' });

    const verdict = await screen(req, data, { checkContent: true });
    if (verdict.action !== 'allow') {
      console.log(`contact blocked (${verdict.reason}) ip=${clientIp(req)}`);
      // A bot gets a success it cannot learn from; a person gets a reason.
      if (verdict.action === 'drop') return res.status(200).json({ ok: true });
      return res.status(verdict.status).json({ error: verdict.error });
    }

    await sendEmail({
      subject: `[adamtank.com contact] ${subject || '(no subject)'}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      replyTo: email,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: HUMAN_FALLBACK });
  }
}
