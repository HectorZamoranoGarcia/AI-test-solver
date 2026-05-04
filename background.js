const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg.type === 'solve') {
    chrome.storage.sync.get('geminiKey').then(({ geminiKey }) => {
      if (!geminiKey) return respond({ error: 'No API key set. Open extension settings.' });
      solve(msg.question, geminiKey).then(respond);
    });
    return true;
  }
});

async function solve(q, apiKey) {
  const prompt =
    `Eres un experto académico. Responde ÚNICAMENTE con la letra de la opción correcta (A, B, C, D...). Sin puntos ni explicación.\n\n` +
    `Pregunta: ${q.text}\n\n` +
    q.options.join('\n') +
    `\n\nRespuesta (solo la letra):`;

  try {
    const r = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 3, temperature: 0 }
      })
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return { error: err?.error?.message || `HTTP ${r.status}` };
    }

    const d = await r.json();
    const raw = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    const letter = raw.match(/[A-Ea-e]/)?.[0]?.toUpperCase() ?? '?';
    return { answer: letter };
  } catch (e) {
    return { error: e.message };
  }
}
