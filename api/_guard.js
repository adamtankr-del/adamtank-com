// Spam screening shared by the public form endpoints.
//
// Layers, cheapest first: origin allowlist, honeypot, a timing token only a
// real page load can produce, per-IP rate limiting, content heuristics, and
// Cloudflare Turnstile when it is configured.
//
// Bot-only signals return a fake success so the sender never learns which
// layer caught it. Content heuristics can misfire on a real person, so those
// return an error the page can show along with a way to reach Adam directly.

const ALLOWED_HOSTS = ['adamtank.com', 'www.adamtank.com', 'localhost', '127.0.0.1'];

const MIN_FILL_MS = 2000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 4;

export const HUMAN_FALLBACK = 'Something went wrong. Please email adam.tank.r@gmail.com directly.';

function hostOf(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function originOk(req) {
  const host = hostOf(req.headers.origin || '') || hostOf(req.headers.referer || '');
  if (!host) return false;
  // Preview deployments are legitimate traffic while testing.
  return ALLOWED_HOSTS.includes(host) || host.endsWith('.vercel.app');
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Best effort only: a serverless instance sees a slice of traffic, not all of
// it. Catching bursts routed to the same warm instance is still worth having.
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

const LINK_RE = /(https?:\/\/|\bwww\.)/gi;
const LINK_MARKUP_RE = /\[url[=\]]|\[\/url\]|<a[\s>]|href\s*=/i;
const SPAM_PHRASE_RE = new RegExp(
  [
    'seo (services|expert|agency|audit)',
    'back ?links?',
    'link building',
    'guest post',
    'rank (your|higher|#1)',
    'first page of google',
    'casino|gambling|betting site',
    'viagra|cialis',
    'crypto (investment|trading|doubler)|forex signals',
    'loan offer|payday loan',
    'buy (followers|likes)',
    'increase (your )?(traffic|sales) (by|guaranteed)',
    'web ?design services',
    'escort',
  ].join('|'),
  'i',
);

function countLinks(text) {
  return (text.match(LINK_RE) || []).length;
}

// A newline in a single-line field is an email-header injection attempt.
function hasControlChars(value) {
  return /[\r\n]/.test(value);
}

export function validEmail(email = '') {
  return (
    email.length <= 254 &&
    !hasControlChars(email) &&
    /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(email)
  );
}

function contentVerdict({ name = '', email = '', subject = '', message = '' }) {
  if ([name, subject].some(hasControlChars)) return 'control chars';
  if (!validEmail(email)) return 'bad email';
  if (countLinks(name) || countLinks(subject)) return 'link in name/subject';
  if (LINK_MARKUP_RE.test(message) || LINK_MARKUP_RE.test(subject)) return 'link markup';
  if (countLinks(message) >= 2) return 'many links';
  if (SPAM_PHRASE_RE.test(`${subject} ${message}`)) return 'spam phrase';
  if (message.trim().length < 15) return 'too short';
  return null;
}

async function turnstileOk(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Not configured yet; the other layers still apply.
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }).toString(),
    });
    const out = await res.json();
    return out.success === true;
  } catch (err) {
    // A Cloudflare outage should not take the form down.
    console.error('turnstile verify failed:', err);
    return true;
  }
}

/**
 * Screen a submission.
 *
 * @returns {Promise<{action: 'allow'} | {action: 'drop', reason: string} | {action: 'reject', status: number, error: string, reason: string}>}
 *   'drop'   — answer 200 and send nothing.
 *   'reject' — answer with status/error so the page can show it.
 */
export async function screen(req, data, { checkContent = false } = {}) {
  const ip = clientIp(req);

  if (!originOk(req)) return { action: 'drop', reason: 'origin' };
  if (data.company_website) return { action: 'drop', reason: 'honeypot' };

  const elapsed = Number(data._t);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return { action: 'drop', reason: 'timing' };
  }

  if (rateLimited(ip)) {
    return {
      action: 'reject',
      status: 429,
      error: 'Too many submissions from this connection. Please try again in a few minutes.',
      reason: 'rate limit',
    };
  }

  if (!(await turnstileOk(data['cf-turnstile-response'], ip))) {
    return { action: 'drop', reason: 'turnstile' };
  }

  if (checkContent) {
    const verdict = contentVerdict(data);
    if (verdict) {
      return {
        action: 'reject',
        status: 422,
        error:
          'That did not get through the spam filter. Email adam.tank.r@gmail.com directly and it will reach me.',
        reason: verdict,
      };
    }
  }

  return { action: 'allow' };
}
