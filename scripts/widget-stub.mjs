// Dev harness for the embeddable WymAssist widget.
// Serves a fake "client website" and a stub of the public assist API so the
// widget can be exercised without the backend stack. Run: npm run dev:widget
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ?? 4173;
const BUNDLE = path.join(ROOT, '..', 'dist-widget', 'wymassist.js');

const messages = [];
let seq = 0;
const msg = (role, content) => ({
  id: `m${++seq}`,
  role,
  content,
  createdAt: new Date().toISOString(),
});

const REPLIES = [
  'Good question — let me check that for you. Our admissions team can walk you through the details.',
  'Thanks for reaching out! Is there anything specific you\u2019d like to know about our services?',
  'I can help with that. Would you like me to book you an appointment, or pass your details to the team?',
];
let replyIdx = 0;

const CONFIG = {
  organization: { name: 'Greenfield School', slug: 'greenfield-school' },
  assistant: {
    name: 'Greenfield Assistant',
    welcomeMessage:
      'Hi! I\u2019m the Greenfield assistant. Ask me anything, or book an appointment right here in the chat.',
  },
  branding: { logoUrl: null, primaryColor: '#0b5c40', secondaryColor: null },
  features: { leadCapture: true, escalation: true, appointments: true },
  intakeFields: [
    {
      key: 'service',
      label: 'Which service are you interested in?',
      type: 'select',
      required: true,
      options: ['Admissions', 'Campus tour', 'Fees & payments', 'Other'],
    },
    {
      key: 'notes',
      label: 'Anything else the team should know?',
      type: 'text',
      required: false,
    },
  ],
};

const PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Client Website — WymAssist stub</title>
    <style>
      body { font-family: Georgia, serif; max-width: 720px; margin: 60px auto; padding: 0 20px; color: #1a2b22; }
      h1 { color: #0b5c40; }
      .card { border: 1px solid #d9e4dd; border-radius: 10px; padding: 20px 24px; background: #f7faf8; }
    </style>
  </head>
  <body>
    <h1>Greenfield School</h1>
    <div class="card">
      <p>This is a stub client website for widget development. Open the chat in the bottom-right.</p>
      <p>Try: the quick actions, booking an appointment by typing <em>friday 2pm</em>, and sharing your details in chat.</p>
    </div>
    <script src="/widget/wymassist.js" data-key="stub" data-api="http://localhost:${PORT}" async></` + `script>
  </body>
</html>`;

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (url.pathname === '/') return res.end(PAGE);
  if (url.pathname === '/widget/wymassist.js') {
    const js = await readFile(BUNDLE);
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    return res.end(js);
  }

  if (!url.pathname.startsWith('/api/v1/public/assist')) {
    res.writeHead(404);
    return res.end('not found');
  }

  const body = await new Promise((resolve) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => resolve(b ? JSON.parse(b) : {}));
  });

  if (url.pathname === '/api/v1/public/assist/config') return json(res, 200, CONFIG);
  if (url.pathname === '/api/v1/public/assist/sessions')
    return json(res, 201, { sessionToken: 'stub-token', expiresAt: null });
  if (url.pathname === '/api/v1/public/assist/session')
    return json(res, 200, { conversation: { id: 'c1', status: 'AI_ACTIVE' } });
  if (url.pathname === '/api/v1/public/assist/messages' && req.method === 'GET')
    return json(res, 200, { items: messages, page: 1, limit: 100, total: messages.length });
  if (url.pathname === '/api/v1/public/assist/messages' && req.method === 'POST') {
    const userMessage = msg('USER', body.content);
    messages.push(userMessage);
    // Simulate the assistant thinking, then replying in the same response —
    // matching the real API's request/response shape.
    await new Promise((r) => setTimeout(r, 900));
    const assistantMessage = msg('ASSISTANT', REPLIES[replyIdx++ % REPLIES.length]);
    messages.push(assistantMessage);
    return json(res, 201, { userMessage, assistantMessage, idempotentReplay: false });
  }
  if (url.pathname === '/api/v1/public/assist/leads')
    return json(res, 201, { id: 'lead-1' });
  if (url.pathname === '/api/v1/public/assist/appointments')
    return json(res, 201, { id: 'appt-1', status: 'REQUESTED' });
  if (url.pathname === '/api/v1/public/assist/handoff')
    return json(res, 201, { id: 'h-1', status: 'REQUESTED' });

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => {
  console.log(`Widget stub at http://localhost:${PORT}`);
  console.log(`  page:    /`);
  console.log(`  bundle:  /widget/wymassist.js  (run \`npm run build:widget\` after changes)`);
});
