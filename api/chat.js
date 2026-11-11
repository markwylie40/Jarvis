const SYSTEM_PROMPT = `You are JARVIS, a capable, calm, thoughtful personal AI assistant. Be clear, useful, and concise. Help the user reason, plan, write, learn, and solve problems. Be honest about uncertainty and never claim to have performed actions you cannot perform. You cannot control the user's device, access other apps, or observe their screen unless a specific authorized integration is provided. Protect private information.`;
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed.' }); }
  if (!process.env.JARVIS_ACCESS_CODE) return res.status(503).json({ error: 'Workspace access is not configured. Add JARVIS_ACCESS_CODE in hosting environment settings.' });
  const suppliedCode = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!suppliedCode || suppliedCode.length !== process.env.JARVIS_ACCESS_CODE.length || suppliedCode !== process.env.JARVIS_ACCESS_CODE) return res.status(401).json({ error: 'Access code required or incorrect.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI is not connected yet. Add OPENAI_API_KEY in your hosting environment settings.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 24) return res.status(400).json({ error: 'Send between 1 and 24 messages.' });
    const messages = body.messages.map(m => {
      if (!m || !['user','assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim() || m.content.length > 12000) throw new Error('Invalid message format.');
      return { role: m.role, content: m.content };
    });
    if (messages[messages.length - 1].role !== 'user') return res.status(400).json({ error: 'The last message must be from the user.' });
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.JARVIS_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages], temperature: 0.7, max_tokens: 1200 })
    });
    const payload = await upstream.json();
    if (!upstream.ok) {
      const message = upstream.status === 401 ? 'The server AI key was rejected. Check OPENAI_API_KEY.' : 'The AI provider returned an error. Please try again shortly.';
      return res.status(upstream.status === 429 ? 429 : 502).json({ error: message });
    }
    const reply = payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    if (typeof reply !== 'string' || !reply.trim()) return res.status(502).json({ error: 'The AI provider returned an empty response.' });
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(400).json({ error: error.message === 'Invalid message format.' ? error.message : 'Could not process this request.' });
  }
};