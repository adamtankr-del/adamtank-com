// Submit handler shared by every <form data-async>. Posts urlencoded, stamps
// the timing token api/_guard.js checks, and surfaces server errors instead of
// a generic "try again".

declare global {
  interface Window {
    turnstile?: { reset: (id?: string) => void };
  }
}

const FALLBACK = 'Something went wrong. Please email adam.tank.r@gmail.com directly.';

document.querySelectorAll<HTMLFormElement>('form[data-async]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const errNote = form.parentElement?.querySelector<HTMLElement>('[data-error]');
    if (errNote) errNote.hidden = true;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending…';
    }

    // Milliseconds since page load. A bot posting straight at the endpoint
    // never runs this, and a script that renders the page rarely waits.
    const stamp = form.querySelector<HTMLInputElement>('input[name="_t"]');
    if (stamp) stamp.value = String(Math.round(performance.now()));

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form) as any).toString(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as { error?: string });
        throw new Error(body.error || FALLBACK);
      }
      form.hidden = true;
      document.querySelectorAll<HTMLElement>('[data-hide-on-success]').forEach((el) => {
        el.hidden = true;
      });
      const note = form.parentElement?.querySelector<HTMLElement>('[data-success]');
      if (note) note.hidden = false;
    } catch (err) {
      if (errNote) {
        errNote.textContent = err instanceof Error ? err.message : FALLBACK;
        errNote.hidden = false;
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Try again';
      }
      window.turnstile?.reset();
    }
  });
});

export {};
