import { sendEmail, readForm } from './_send.js';
import { screen, clientIp, validEmail, HUMAN_FALLBACK } from './_guard.js';

// Adds the subscriber to the Resend audience, then notifies Adam.
// Contact creation needs a full-access key; RESEND_API_KEY is sending-only.
async function addToAudience(email) {
  const key = process.env.RESEND_AUDIENCE_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) return 'not-configured';

  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  if (res.ok) return 'added';

  // A repeat subscriber is not an error worth showing them.
  const body = await res.text();
  if (res.status === 409 || /already exists/i.test(body)) return 'already-subscribed';
  throw new Error(`Resend contacts error ${res.status}: ${body}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    const data = await readForm(req);
    const { email = '' } = data;
    if (!validEmail(email)) return res.status(400).json({ error: 'That email address does not look right.' });

    const verdict = await screen(req, data);
    if (verdict.action !== 'allow') {
      console.log(`subscribe blocked (${verdict.reason}) ip=${clientIp(req)}`);
      if (verdict.action === 'drop') return res.status(200).json({ ok: true });
      return res.status(verdict.status).json({ error: verdict.error });
    }

    let status;
    try {
      status = await addToAudience(email);
    } catch (err) {
      // Never lose a subscriber to an audience API failure; the
      // notification email below is the backstop record.
      console.error('audience add failed:', err);
      status = 'failed';
    }

    await sendEmail({
      subject: '[adamtank.com] New newsletter subscriber',
      text: `New subscriber from adamtank.com: ${email}\nAudience: ${status}`,
      replyTo: email,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: HUMAN_FALLBACK });
  }
}
