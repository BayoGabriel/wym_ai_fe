import {
  getConfig,
  createSession,
  validateSession,
  listMessages,
  sendMessage,
  submitLead,
  requestHandoff,
  requestAppointment,
} from './api';
import type { WidgetConfig, ChatMessage, IntakeField } from './api';
import { buildStyles } from './styles';
import { parseWhen } from './parse-when';

const SESSION_KEY = (refId: string) => `wymassist_session_${refId}`;
const PROFILE_KEY = (refId: string) => `wymassist_profile_${refId}`;

interface VisitorProfile {
  name?: string;
  email?: string;
  phone?: string;
}

type StepInput = 'text' | 'contact' | 'choice' | 'datetime' | 'confirm';

interface FlowStep {
  key: string;
  input: StepInput;
  ask: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
  placeholder?: string;
  validate?: (v: string) => string | null;
}

interface ActiveFlow {
  kind: 'lead' | 'appointment';
  steps: FlowStep[];
  i: number;
  data: Record<string, string>;
  customFields: Record<string, string | boolean>;
}

const ICONS = {
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M4 5h16v11H9.5L4 19.5z"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><path d="M12 19V5m0 0l-6 6m6-6l6 6"/></svg>',
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fmtWhen(date: string, time: string) {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dayName = dt.toLocaleDateString(undefined, { weekday: 'short' });
  const label = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return `${dayName}, ${label} · ${time}`;
}

function fmtTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

class WymAssistWidget {
  private apiBase: string;
  private ref: { organizationKey?: string; organizationSlug?: string };
  private refId: string;
  private config: WidgetConfig | null = null;
  private token: string | null = null;
  private open = false;
  private pollTimer: number | null = null;
  private root: ShadowRoot;
  private bodyEl!: HTMLDivElement;
  private composerInput!: HTMLInputElement;
  private launcher!: HTMLButtonElement;
  private knownIds = new Set<string>();
  private pendingUser: { reqId: string; content: string; node: HTMLDivElement }[] = [];
  private flow: ActiveFlow | null = null;
  private stepControl: HTMLElement | null = null;
  private typingEl: HTMLDivElement | null = null;
  private profile: VisitorProfile = {};

  constructor(script: HTMLScriptElement) {
    this.apiBase = (script.dataset.api ?? '').replace(/\/$/, '');
    // Prefer the rotatable public key (data-key); the slug (data-org) remains
    // supported for embeds created before keys existed.
    this.ref = script.dataset.key
      ? { organizationKey: script.dataset.key }
      : { organizationSlug: script.dataset.org ?? '' };
    this.refId = script.dataset.key ?? script.dataset.org ?? '';
    const host = document.createElement('div');
    document.body.appendChild(host);
    this.root = host.attachShadow({ mode: 'open' });
    try {
      this.profile = JSON.parse(localStorage.getItem(PROFILE_KEY(this.refId)) ?? '{}');
    } catch {
      this.profile = {};
    }
  }

  async boot() {
    if (!this.apiBase || !this.refId) return;
    try {
      this.config = await getConfig(this.apiBase, this.ref);
    } catch {
      return; // assistant unavailable / origin not allowed — stay silent
    }
    const primary = this.config.branding.primaryColor ?? '#0b5c40';
    const style = document.createElement('style');
    style.textContent = buildStyles(primary);
    this.root.appendChild(style);

    this.launcher = el('button', 'launcher') as HTMLButtonElement;
    this.launcher.innerHTML = ICONS.chat;
    this.launcher.setAttribute('aria-label', 'Open chat');
    this.launcher.addEventListener('click', () => this.toggle());
    this.root.appendChild(this.launcher);

    const panel = el('div', 'panel hidden');
    panel.appendChild(this.buildHeader());
    panel.appendChild(this.buildActions());
    this.bodyEl = el('div', 'body');
    this.bodyEl.setAttribute('aria-live', 'polite');
    panel.appendChild(this.bodyEl);
    panel.appendChild(this.buildComposer());
    panel.appendChild(el('div', 'foot', 'Powered by WymNet AI'));
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.open) this.toggle();
    });
    this.root.appendChild(panel);
  }

  private get assistantName() {
    return this.config?.assistant.name ?? 'Assistant';
  }

  private buildHeader(): HTMLDivElement {
    const head = el('div', 'head');
    const mark = el('span', 'mark');
    if (this.config?.branding.logoUrl) {
      const img = document.createElement('img');
      img.src = this.config.branding.logoUrl;
      img.alt = '';
      mark.appendChild(img);
    } else {
      mark.textContent = (this.config?.organization.name ?? 'W')[0].toUpperCase();
    }
    head.appendChild(mark);
    const t = el('div');
    t.appendChild(
      el('div', 't', this.config?.assistant.name ?? this.config?.organization.name ?? 'Assistant')
    );
    t.appendChild(el('div', 's', `${this.config?.organization.name ?? ''} · online`));
    head.appendChild(t);
    const close = el('button', 'x') as HTMLButtonElement;
    close.innerHTML = ICONS.close;
    close.setAttribute('aria-label', 'Close chat');
    close.addEventListener('click', () => this.toggle());
    head.appendChild(close);
    return head;
  }

  private buildActions(): HTMLDivElement {
    const actions = el('div', 'actions');
    const add = (label: string, fn: () => void) => {
      const b = el('button', 'chip', label) as HTMLButtonElement;
      b.addEventListener('click', fn);
      actions.appendChild(b);
    };
    if (this.config?.features.appointments) {
      add('Book appointment', () => this.startAppointmentFlow());
    }
    if (this.config?.features.leadCapture) {
      add('Share my details', () => this.startLeadFlow());
    }
    if (this.config?.features.escalation) {
      add('Talk to a human', () => void this.handoff());
    }
    if (!actions.children.length) actions.classList.add('hidden');
    return actions;
  }

  private buildComposer(): HTMLDivElement {
    const composer = el('div', 'composer');
    this.composerInput = document.createElement('input');
    this.composerInput.placeholder = 'Type a message…';
    this.composerInput.setAttribute('aria-label', 'Message');
    this.composerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') void this.send();
    });
    const send = el('button', 'send') as HTMLButtonElement;
    send.innerHTML = ICONS.send;
    send.setAttribute('aria-label', 'Send message');
    send.addEventListener('click', () => void this.send());
    composer.appendChild(this.composerInput);
    composer.appendChild(send);
    return composer;
  }

  /* ── Panel & session ─────────────────────────────────────── */

  private toggle() {
    this.open = !this.open;
    const panel = this.root.querySelector('.panel');
    panel?.classList.toggle('hidden', !this.open);
    this.launcher.innerHTML = this.open ? ICONS.close : ICONS.chat;
    this.launcher.setAttribute('aria-label', this.open ? 'Close chat' : 'Open chat');
    if (this.open) {
      void this.ensureSession().then(() => this.syncMessages());
      this.composerInput.focus();
    }
    this.setPolling(this.open);
  }

  private setPolling(on: boolean) {
    if (this.pollTimer) window.clearInterval(this.pollTimer);
    this.pollTimer = on ? window.setInterval(() => void this.syncMessages(), 6000) : null;
  }

  private async ensureSession(): Promise<boolean> {
    if (this.token) return true;
    const saved = localStorage.getItem(SESSION_KEY(this.refId));
    if (saved) {
      try {
        await validateSession(this.apiBase, saved);
        this.token = saved;
        return true;
      } catch {
        localStorage.removeItem(SESSION_KEY(this.refId));
      }
    }
    try {
      const s = await createSession(this.apiBase, this.ref);
      this.token = s.sessionToken;
      localStorage.setItem(SESSION_KEY(this.refId), s.sessionToken);
      this.showWelcome();
      return true;
    } catch {
      this.assistantBubble('Chat is unavailable right now. Please try again later.');
      return false;
    }
  }

  /* ── Message rendering (incremental — never wipes the thread) ── */

  private scrollDown(force = false) {
    const nearBottom =
      this.bodyEl.scrollHeight - this.bodyEl.scrollTop - this.bodyEl.clientHeight < 90;
    if (force || nearBottom) this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
  }

  private msgNode(m: ChatMessage): HTMLDivElement {
    const cls = m.role === 'USER' ? 'u' : m.role === 'AGENT' ? 'g' : 'a';
    const b = el('div', `msg ${cls}`);
    const who = m.role === 'USER' ? 'You' : m.role === 'AGENT' ? 'Staff' : this.assistantName;
    b.appendChild(el('span', 'who', who));
    b.appendChild(document.createTextNode(m.content));
    const t = fmtTime(m.createdAt);
    if (t) b.title = t;
    return b;
  }

  /** Append a server message, or bind it to its optimistic local bubble. */
  private bindOrAppend(m: ChatMessage) {
    if (this.knownIds.has(m.id)) return;
    if (m.role === 'USER') {
      const p = this.pendingUser.findIndex((x) => x.content === m.content);
      if (p >= 0) {
        const [pending] = this.pendingUser.splice(p, 1);
        pending.node.classList.remove('failed');
        const t = fmtTime(m.createdAt);
        if (t) pending.node.title = t;
        this.knownIds.add(m.id);
        return;
      }
    }
    this.knownIds.add(m.id);
    this.bodyEl.appendChild(this.msgNode(m));
    this.scrollDown();
  }

  private async syncMessages() {
    if (!this.token) return;
    try {
      const { items } = await listMessages(this.apiBase, this.token);
      if (items.length === 0 && this.knownIds.size === 0) this.showWelcome();
      for (const m of items) this.bindOrAppend(m);
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.token = null;
        localStorage.removeItem(SESSION_KEY(this.refId));
        void this.ensureSession();
      }
      /* otherwise keep quiet on poll failures */
    }
  }

  private showWelcome() {
    const welcome = this.config?.assistant.welcomeMessage;
    if (welcome && !this.root.querySelector('.msg')) {
      this.assistantBubble(welcome);
    }
  }

  private appendBubble(role: 'USER' | 'ASSISTANT' | 'AGENT', content: string): HTMLDivElement {
    const cls = role === 'USER' ? 'u' : role === 'AGENT' ? 'g' : 'a';
    const who = role === 'USER' ? 'You' : role === 'AGENT' ? 'Staff' : this.assistantName;
    const b = el('div', `msg ${cls}`);
    b.appendChild(el('span', 'who', who));
    b.appendChild(document.createTextNode(content));
    this.bodyEl.appendChild(b);
    this.scrollDown(true);
    return b;
  }

  private assistantBubble(content: string) {
    this.appendBubble('ASSISTANT', content);
  }

  private userEcho(content: string) {
    this.appendBubble('USER', content);
  }

  private showTyping(): HTMLDivElement {
    if (this.typingEl) this.typingEl.remove();
    const t = el('div', 'typing');
    t.appendChild(el('i'));
    t.appendChild(el('i'));
    t.appendChild(el('i'));
    this.bodyEl.appendChild(t);
    this.typingEl = t;
    this.scrollDown(true);
    return t;
  }

  private hideTyping() {
    this.typingEl?.remove();
    this.typingEl = null;
  }

  /* ── Sending ─────────────────────────────────────────────── */

  private async send() {
    const content = this.composerInput.value.trim();
    if (!content) return;
    this.composerInput.value = '';
    if (this.flow) {
      this.routeFlowText(content);
      return;
    }
    await this.sendUserMessage(content);
  }

  private async sendUserMessage(content: string) {
    if (!(await this.ensureSession()) || !this.token) return;
    const reqId = crypto.randomUUID();
    const node = this.appendBubble('USER', content);
    this.pendingUser.push({ reqId, content, node });
    this.showTyping();
    try {
      const r = await sendMessage(this.apiBase, this.token, content, reqId);
      this.hideTyping();
      this.bindOrAppend(r.userMessage);
      if (r.assistantMessage) this.bindOrAppend(r.assistantMessage);
    } catch (e) {
      this.hideTyping();
      node.classList.add('failed');
      this.assistantBubble((e as Error).message ?? 'Something went wrong — please try again.');
    }
  }

  /* ── Conversational flows (lead capture & appointment booking) ── */

  private saveProfile() {
    try {
      localStorage.setItem(PROFILE_KEY(this.refId), JSON.stringify(this.profile));
    } catch {
      /* private mode — profile simply won't persist */
    }
  }

  private startFlow(kind: ActiveFlow['kind'], steps: FlowStep[]) {
    this.flow = { kind, steps, i: 0, data: {}, customFields: {} };
    this.askStep();
  }

  private startLeadFlow() {
    if (this.flow) return this.nudge('Finish or cancel the current request first.');
    const steps: FlowStep[] = [];
    if (!this.profile.name) {
      steps.push({
        key: 'name',
        input: 'text',
        ask: 'Happy to pass your details to the team. What\u2019s your name?',
        placeholder: 'Your name…',
        validate: (v) => (v.trim().length < 2 ? 'Could I get your name?' : null),
      });
    }
    if (!this.profile.email && !this.profile.phone) {
      steps.push({
        key: 'contact',
        input: 'contact',
        ask: 'And how can the team reach you — an email or phone number?',
        placeholder: 'Email or phone…',
      });
    }
    for (const f of this.config?.intakeFields ?? []) {
      steps.push(this.intakeStep(f));
    }
    steps.push({
      key: 'confirm',
      input: 'confirm',
      ask: 'Here\u2019s what I\u2019ll share with the team — look right?',
    });
    this.startFlow('lead', steps);
  }

  private startAppointmentFlow() {
    if (this.flow) return this.nudge('Finish or cancel the current request first.');
    const steps: FlowStep[] = [];
    if (!this.profile.name) {
      steps.push({
        key: 'name',
        input: 'text',
        ask: 'Let\u2019s get that booked. What\u2019s your name?',
        placeholder: 'Your name…',
        validate: (v) => (v.trim().length < 2 ? 'Could I get your name?' : null),
      });
    }
    steps.push({
      key: 'when',
      input: 'datetime',
      ask: 'When would you like to come in? Pick a slot below or just type it — \u201cfriday 2pm\u201d works too.',
    });
    if (!this.profile.email && !this.profile.phone) {
      steps.push({
        key: 'contact',
        input: 'contact',
        ask: 'What\u2019s the best email or phone number to reach you if plans change?',
        placeholder: 'Email or phone…',
        optional: true,
      });
    }
    steps.push({
      key: 'reason',
      input: 'text',
      ask: 'Anything the team should prepare for?',
      placeholder: 'Reason (optional)…',
      optional: true,
    });
    steps.push({
      key: 'confirm',
      input: 'confirm',
      ask: 'Here\u2019s your request — shall I send it?',
    });
    this.startFlow('appointment', steps);
  }

  private intakeStep(f: IntakeField): FlowStep {
    if (f.type === 'select') {
      return {
        key: `cf:${f.key}`,
        input: 'choice',
        ask: f.label,
        options: (f.options ?? []).map((o) => ({ value: o, label: o })),
        optional: !f.required,
      };
    }
    if (f.type === 'checkbox') {
      return {
        key: `cf:${f.key}`,
        input: 'choice',
        ask: f.label,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      };
    }
    return { key: `cf:${f.key}`, input: 'text', ask: f.label, optional: !f.required };
  }

  private askStep() {
    const f = this.flow;
    if (!f) return;
    const s = f.steps[f.i];
    this.assistantBubble(s.ask);

    if (s.input === 'text' || s.input === 'contact') {
      this.composerInput.placeholder = s.placeholder ?? 'Type your answer…';
      this.composerInput.focus();
      if (s.optional) this.appendStepChips([{ value: '__skip__', label: 'Skip' }]);
      else this.appendCancel();
      return;
    }

    if (s.input === 'choice') {
      const chips = [...(s.options ?? [])];
      if (s.optional) chips.push({ value: '__skip__', label: 'Skip' });
      this.appendStepChips(chips);
      return;
    }

    if (s.input === 'datetime') {
      this.composerInput.placeholder = 'e.g. Friday 2:30 pm…';
      this.appendDateCard();
      return;
    }

    // confirm
    this.appendConfirmCard();
  }

  private clearStepControl() {
    this.stepControl?.remove();
    this.stepControl = null;
  }

  private appendStepChips(options: { value: string; label: string }[]) {
    const row = el('div', 'qreplies');
    for (const o of options) {
      const b = el(
        'button',
        `qr${o.value === '__skip__' ? ' skip' : ''}`,
        o.label
      ) as HTMLButtonElement;
      b.addEventListener('click', () => this.pickOption(o.value, o.label));
      row.appendChild(b);
    }
    const cancel = el('button', 'cancel-flow', 'Cancel');
    cancel.addEventListener('click', () => this.abortFlow());
    row.appendChild(cancel);
    this.bodyEl.appendChild(row);
    this.stepControl = row;
    this.scrollDown(true);
  }

  private appendCancel() {
    const c = el('button', 'cancel-flow', 'Cancel request');
    c.addEventListener('click', () => this.abortFlow());
    this.bodyEl.appendChild(c);
    this.stepControl = c;
    this.scrollDown(true);
  }

  private appendDateCard() {
    const card = el('div', 'card');
    card.appendChild(el('span', 'ct', 'Pick a date & time'));
    const row = el('div', 'dtrow');
    const date = document.createElement('input');
    date.type = 'date';
    date.min = new Date().toISOString().slice(0, 10);
    const time = document.createElement('input');
    time.type = 'time';
    row.appendChild(date);
    row.appendChild(time);
    card.appendChild(row);
    const err = el('span', 'cerr hidden');
    card.appendChild(err);
    const crow = el('div', 'crow');
    const go = el('button', 'cbtn p', 'Continue') as HTMLButtonElement;
    go.addEventListener('click', () => {
      if (!date.value || !time.value) {
        err.textContent = 'Please pick both a date and a time.';
        err.classList.remove('hidden');
        return;
      }
      card.remove();
      this.answerWhen(date.value, time.value);
    });
    const cancel = el('button', 'cbtn s', 'Cancel') as HTMLButtonElement;
    cancel.addEventListener('click', () => this.abortFlow());
    crow.appendChild(go);
    crow.appendChild(cancel);
    card.appendChild(crow);
    this.bodyEl.appendChild(card);
    this.stepControl = card;
    this.scrollDown(true);
  }

  private confirmLines(): [string, string][] {
    const f = this.flow!;
    const d = f.data;
    const lines: [string, string][] = [];
    const name = this.profile.name ?? d.name;
    const email = this.profile.email ?? d.email;
    const phone = this.profile.phone ?? d.phone;
    if (name) lines.push(['Name', name]);
    if (f.kind === 'appointment' && d.date && d.time) lines.push(['When', fmtWhen(d.date, d.time)]);
    if (email) lines.push(['Email', email]);
    if (phone) lines.push(['Phone', phone]);
    if (f.kind === 'appointment' && d.reason) lines.push(['Reason', d.reason]);
    if (f.kind === 'lead') {
      for (const fld of this.config?.intakeFields ?? []) {
        const v = f.customFields[fld.key];
        if (v !== undefined)
          lines.push([fld.label, v === true ? 'Yes' : v === false ? 'No' : String(v)]);
      }
    }
    return lines;
  }

  private appendConfirmCard() {
    const card = el('div', 'card');
    card.appendChild(
      el('span', 'ct', this.flow!.kind === 'lead' ? 'Your details' : 'Appointment request')
    );
    const sum = el('div', 'sum');
    for (const [k, v] of this.confirmLines()) {
      const line = el('div');
      line.appendChild(el('b', undefined, `${k}: `));
      line.appendChild(document.createTextNode(v));
      sum.appendChild(line);
    }
    card.appendChild(sum);
    const err = el('span', 'cerr hidden');
    card.appendChild(err);
    const crow = el('div', 'crow');
    const yes = el('button', 'cbtn p', 'Confirm') as HTMLButtonElement;
    const no = el('button', 'cbtn s', 'Cancel') as HTMLButtonElement;
    yes.addEventListener('click', () => {
      yes.disabled = true;
      no.disabled = true;
      yes.textContent = 'Sending…';
      void this.finishFlow(card, err, yes, no);
    });
    no.addEventListener('click', () => this.abortFlow());
    crow.appendChild(yes);
    crow.appendChild(no);
    card.appendChild(crow);
    this.bodyEl.appendChild(card);
    this.stepControl = card;
    this.scrollDown(true);
  }

  private async finishFlow(
    card: HTMLElement,
    err: HTMLElement,
    yes: HTMLButtonElement,
    no: HTMLButtonElement
  ) {
    const f = this.flow;
    if (!f) return;
    if (!(await this.ensureSession()) || !this.token) {
      err.textContent = 'Chat session unavailable — try again.';
      err.classList.remove('hidden');
      yes.disabled = false;
      no.disabled = false;
      yes.textContent = 'Confirm';
      return;
    }
    const d = f.data;
    const name = this.profile.name ?? d.name ?? '';
    const email = this.profile.email ?? d.email;
    const phone = this.profile.phone ?? d.phone;
    try {
      if (f.kind === 'appointment') {
        await requestAppointment(this.apiBase, this.token, {
          customerName: name,
          email,
          phone,
          preferredDate: d.date,
          preferredTime: d.time,
          reason: d.reason || undefined,
        });
      } else {
        await submitLead(this.apiBase, this.token, {
          name: name || undefined,
          email,
          phone,
          consentToContact: true,
          customFields: f.customFields,
        });
      }
      this.profile = { ...this.profile, name: name || this.profile.name, email, phone };
      this.saveProfile();
      card.remove();
      this.endFlow();
      this.assistantBubble(
        f.kind === 'appointment'
          ? 'Done — your appointment request is with the team. They\u2019ll confirm shortly.'
          : 'All set — your details are with the team. Anything else I can help with?'
      );
    } catch (e) {
      err.textContent = (e as Error).message;
      err.classList.remove('hidden');
      yes.disabled = false;
      no.disabled = false;
      yes.textContent = 'Confirm';
    }
  }

  private pickOption(value: string, label: string) {
    const f = this.flow;
    if (!f) return;
    const s = f.steps[f.i];
    if (value === '__skip__') {
      this.userEcho('Skip');
      return this.advance();
    }
    this.userEcho(label);
    if (s.key.startsWith('cf:')) {
      f.customFields[s.key.slice(3)] = value === 'yes' ? true : value === 'no' ? false : value;
    } else {
      f.data[s.key] = value;
    }
    this.advance();
  }

  private answerWhen(date: string, time: string) {
    const f = this.flow;
    if (!f) return;
    f.data.date = date;
    f.data.time = time;
    this.userEcho(fmtWhen(date, time));
    this.advance();
  }

  private routeFlowText(content: string) {
    const f = this.flow;
    if (!f) return;
    const s = f.steps[f.i];
    const lc = content.toLowerCase().trim();

    if (['cancel', 'stop', 'never mind', 'nevermind'].includes(lc)) return this.abortFlow();
    if (lc === 'skip' && s.optional) {
      this.userEcho('Skip');
      return this.advance();
    }

    if (s.input === 'text') {
      const err = s.validate?.(content);
      if (err) return this.nudge(err);
      this.userEcho(content);
      if (s.key.startsWith('cf:')) f.customFields[s.key.slice(3)] = content;
      else f.data[s.key] = content;
      return this.advance();
    }

    if (s.input === 'contact') {
      if (EMAIL_RE.test(content)) f.data.email = content;
      else if (content.replace(/\D/g, '').length >= 5) f.data.phone = content;
      else
        return this.nudge(
          'That doesn\u2019t look like an email or phone number — try again, or type "skip".'
        );
      this.userEcho(content);
      return this.advance();
    }

    if (s.input === 'datetime') {
      const parsed = parseWhen(content);
      if (!parsed) {
        return this.nudge(
          'I didn\u2019t catch a date and time — try \u201c14 Nov, 2:30 pm\u201d or \u201cfriday 10am\u201d, or use the picker above.'
        );
      }
      const when = new Date(`${parsed.date}T${parsed.time}`);
      if (when.getTime() < Date.now() - 60000) {
        return this.nudge(
          'That time looks like it\u2019s already passed — pick one in the future.'
        );
      }
      return this.answerWhen(parsed.date, parsed.time);
    }

    if (s.input === 'choice') {
      const match = (s.options ?? []).find(
        (o) => o.label.toLowerCase() === lc || o.value.toLowerCase() === lc
      );
      if (match) return this.pickOption(match.value, match.label);
      return this.nudge('Please pick one of the options above — or type "cancel" to stop.');
    }

    // confirm step
    if (['yes', 'y', 'confirm', 'ok', 'sure', 'send'].includes(lc)) {
      const btn = this.stepControl?.querySelector('.cbtn.p') as HTMLButtonElement | null;
      if (btn) {
        this.userEcho(content);
        btn.click();
        return;
      }
    }
    if (['no', 'n'].includes(lc)) {
      this.userEcho(content);
      return this.abortFlow();
    }
    this.nudge('Type "yes" to confirm, or "cancel" to stop.');
  }

  private nudge(text: string) {
    this.assistantBubble(text);
  }

  private advance() {
    const f = this.flow;
    if (!f) return;
    this.clearStepControl();
    f.i += 1;
    this.askStep();
  }

  private endFlow() {
    this.flow = null;
    this.clearStepControl();
    this.composerInput.placeholder = 'Type a message…';
  }

  private abortFlow() {
    if (!this.flow) return;
    this.endFlow();
    this.assistantBubble('No problem — I\u2019ve cancelled that. Anything else I can help with?');
  }

  /* ── Handoff ─────────────────────────────────────────────── */

  private async handoff() {
    if (!(await this.ensureSession()) || !this.token) return;
    try {
      await requestHandoff(this.apiBase, this.token);
      this.assistantBubble(
        'Your enquiry has been forwarded to a member of staff. Keep chatting here — replies appear automatically.'
      );
    } catch (e) {
      this.assistantBubble((e as Error).message);
    }
  }
}

const script = document.currentScript as HTMLScriptElement | null;
if (script) {
  const widget = new WymAssistWidget(script);
  void widget.boot();
}
