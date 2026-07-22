// Shared Resend email helper for form endpoints.
export async function sendEmail({ subject, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL || 'adam.tank.r@gmail.com';
  if (!key) throw new Error('RESEND_API_KEY not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'adamtank.com <onboarding@resend.dev>',
      to: [to],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
}

export async function readForm(req) {
  const type = req.headers['content-type'] || '';
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks).toString('utf8');
  if (type.includes('application/json')) return JSON.parse(body);
  return Object.fromEntries(new URLSearchParams(body));
}
