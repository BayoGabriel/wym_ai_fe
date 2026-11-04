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
import type { WidgetConfig, ChatMessage } from './api';
import { buildStyles } from './styles';

const SESSION_KEY = (refId: string) => `wymassist_session_${refId}`;

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
  private viewEl!: HTMLDivElement;
  private composerInput!: HTMLInputElement;

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

    const launcher = el('button', 'launcher', '✦');
    launcher.setAttribute('aria-label', 'Open chat');
    launcher.addEventListener('click', () => this.toggle());
    this.root.appendChild(launcher);

    const panel = el('div', 'panel hidden');
    panel.appendChild(this.buildHeader());
    this.viewEl = el('div', 'form-view hidden');
    this.bodyEl = el('div', 'body');
    panel.appendChild(this.bodyEl);
    panel.appendChild(this.viewEl);
    panel.appendChild(this.buildActions());
    const composer = this.buildComposer();
    panel.appendChild(composer);
    const foot = el('div', 'foot', 'Powered by WymNet AI');
    panel.appendChild(foot);
    this.root.appendChild(panel);
    launcher.addEventListener('click', () => panel.classList.toggle('hidden'));
  }

  private buildHeader(): HTMLDivElement {
    const head = el('div', 'head');
    if (this.config?.branding.logoUrl) {
      const img = document.createElement('img');
      img.src = this.config.branding.logoUrl;
      img.alt = '';
      head.appendChild(img);
    }
    const t = el('div');
    t.appendChild(
      el('div', 't', this.config?.assistant.name ?? this.config?.organization.name ?? 'Assistant')
    );
    t.appendChild(el('div', 's', `at ${this.config?.organization.name ?? ''}`));
    head.appendChild(t);
    return head;
  }

  private buildActions(): HTMLDivElement {
    const actions = el('div', 'actions');
    if (this.config?.features.leadCapture) {
      const b = el('button', 'chip', 'Share my details');
      b.addEventListener('click', () => this.showLeadForm());
      actions.appendChild(b);
    }
    if (this.config?.features.appointments) {
      const b = el('button', 'chip', 'Request appointment');
      b.addEventListener('click', () => this.showAppointmentForm());
      actions.appendChild(b);
    }
    if (this.config?.features.escalation) {
      const b = el('button', 'chip', 'Talk to a human');
      b.addEventListener('click', () => this.handoff());
      actions.appendChild(b);
    }
    return actions;
  }

  private buildComposer(): HTMLDivElement {
    const composer = el('div', 'composer');
    this.composerInput = document.createElement('input');
    this.composerInput.placeholder = 'Type a message…';
    this.composerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') void this.send();
    });
    const send = el('button', undefined, 'Send');
    send.addEventListener('click', () => void this.send());
    composer.appendChild(this.composerInput);
    composer.appendChild(send);
    return composer;
  }

  private toggle() {
    this.open = !this.open;
    if (this.open) void this.ensureSession().then(() => this.loadMessages());
    this.setPolling(this.open);
  }

  private setPolling(on: boolean) {
    if (this.pollTimer) window.clearInterval(this.pollTimer);
    this.pollTimer = on ? window.setInterval(() => void this.loadMessages(), 6000) : null;
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
      const welcome = this.config?.assistant.welcomeMessage;
      if (welcome)
        this.addBubble({ id: 'welcome', role: 'ASSISTANT', content: welcome, createdAt: '' });
      return true;
    } catch {
      this.addBubble({
        id: 'err',
        role: 'ASSISTANT',
        content: 'Chat is unavailable right now. Please try later.',
        createdAt: '',
      });
      return false;
    }
  }

  private addBubble(m: ChatMessage) {
    const cls = m.role === 'USER' ? 'u' : m.role === 'AGENT' ? 'g' : 'a';
    const b = el('div', `msg ${cls}`);
    if (m.role === 'AGENT') b.appendChild(el('span', 'who', 'Staff'));
    b.appendChild(document.createTextNode(m.content));
    this.bodyEl.appendChild(b);
    this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
  }

  private async loadMessages() {
    if (!this.token) return;
    try {
      const { items } = await listMessages(this.apiBase, this.token);
      this.bodyEl.innerHTML = '';
      if (items.length === 0 && this.config?.assistant.welcomeMessage) {
        this.addBubble({
          id: 'welcome',
          role: 'ASSISTANT',
          content: this.config.assistant.welcomeMessage,
          createdAt: '',
        });
      }
      for (const m of items) {
        const b = el('div', `msg ${m.role === 'USER' ? 'u' : m.role === 'AGENT' ? 'g' : 'a'}`);
        if (m.role === 'AGENT') b.appendChild(el('span', 'who', 'Staff'));
        b.appendChild(document.createTextNode(m.content));
        this.bodyEl.appendChild(b);
      }
      this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    } catch {
      /* keep quiet on poll failures */
    }
  }

  private async send() {
    const content = this.composerInput.value.trim();
    if (!content) return;
    if (!(await this.ensureSession()) || !this.token) return;
    this.composerInput.value = '';
    this.addBubble({ id: crypto.randomUUID(), role: 'USER', content, createdAt: '' });
    const typing = el('div', 'typing', 'Assistant is typing…');
    this.bodyEl.appendChild(typing);
    this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    try {
      const r = await sendMessage(this.apiBase, this.token, content);
      typing.remove();
      if (r.assistantMessage) this.addBubble(r.assistantMessage);
    } catch (e) {
      typing.remove();
      this.addBubble({
        id: 'e',
        role: 'ASSISTANT',
        content: (e as Error).message ?? 'Something went wrong.',
        createdAt: '',
      });
    }
  }

  private showView(build: (view: HTMLDivElement) => void) {
    this.viewEl.innerHTML = '';
    this.viewEl.classList.remove('hidden');
    this.bodyEl.classList.add('hidden');
    build(this.viewEl);
    const back = el('button', 'btn s', 'Back to chat');
    back.addEventListener('click', () => this.hideView());
    const row = el('div', 'row');
    row.appendChild(back);
    this.viewEl.appendChild(row);
  }

  private hideView() {
    this.viewEl.classList.add('hidden');
    this.bodyEl.classList.remove('hidden');
  }

  private showLeadForm() {
    this.showView((v) => {
      v.appendChild(el('h3', undefined, 'Share your details'));
      const fields: Record<string, HTMLInputElement | HTMLSelectElement> = {};
      const base: [string, string, string][] = [
        ['name', 'Name', 'text'],
        ['email', 'Email', 'email'],
        ['phone', 'Phone', 'tel'],
      ];
      for (const [key, label, type] of base) {
        const l = el('label', undefined, label);
        const input = document.createElement('input');
        input.type = type;
        l.appendChild(input);
        fields[key] = input;
        v.appendChild(l);
      }
      const custom: Record<string, HTMLInputElement | HTMLSelectElement> = {};
      for (const f of this.config?.intakeFields ?? []) {
        const l = el('label', undefined, f.label + (f.required ? ' *' : ''));
        let input: HTMLInputElement | HTMLSelectElement;
        if (f.type === 'select') {
          input = document.createElement('select');
          input.appendChild(new Option('—', ''));
          for (const o of f.options ?? []) input.appendChild(new Option(o, o));
        } else {
          input = document.createElement('input');
          input.type = f.type === 'checkbox' ? 'checkbox' : 'text';
        }
        l.appendChild(input);
        custom[f.key] = input;
        v.appendChild(l);
      }
      const err = el('div', 'err hidden');
      const ok = el('div', 'ok hidden');
      const submit = el('button', 'btn p', 'Submit');
      submit.addEventListener('click', () => {
        void (async () => {
          err.classList.add('hidden');
          if (!(await this.ensureSession()) || !this.token) return;
          const customFields: Record<string, unknown> = {};
          for (const f of this.config?.intakeFields ?? []) {
            const i = custom[f.key];
            customFields[f.key] =
              i instanceof HTMLInputElement && i.type === 'checkbox' ? i.checked : i.value;
            if (f.required && !customFields[f.key]) {
              err.textContent = `${f.label} is required.`;
              err.classList.remove('hidden');
              return;
            }
          }
          try {
            await submitLead(this.apiBase, this.token, {
              name: fields.name.value || undefined,
              email: fields.email.value || undefined,
              phone: fields.phone.value || undefined,
              consentToContact: true,
              customFields,
            });
            ok.textContent = 'Thank you — your details were shared with the team.';
            ok.classList.remove('hidden');
            submit.setAttribute('disabled', 'true');
          } catch (e) {
            err.textContent = (e as Error).message;
            err.classList.remove('hidden');
          }
        })();
      });
      const row = el('div', 'row');
      row.appendChild(submit);
      v.appendChild(err);
      v.appendChild(ok);
      v.appendChild(row);
    });
  }

  private showAppointmentForm() {
    this.showView((v) => {
      v.appendChild(el('h3', undefined, 'Request an appointment'));
      const make = (label: string, type: string) => {
        const l = el('label', undefined, label);
        const i = document.createElement('input');
        i.type = type;
        l.appendChild(i);
        v.appendChild(l);
        return i;
      };
      const name = make('Your name *', 'text');
      const email = make('Email', 'email');
      const phone = make('Phone', 'tel');
      const date = make('Preferred date *', 'date');
      const time = make('Preferred time *', 'time');
      const reason = make('Reason', 'text');
      const err = el('div', 'err hidden');
      const ok = el('div', 'ok hidden');
      const submit = el('button', 'btn p', 'Request');
      submit.addEventListener('click', () => {
        void (async () => {
          err.classList.add('hidden');
          if (!name.value || !date.value || !time.value) {
            err.textContent = 'Name, date and time are required.';
            err.classList.remove('hidden');
            return;
          }
          if (!(await this.ensureSession()) || !this.token) return;
          try {
            await requestAppointment(this.apiBase, this.token, {
              customerName: name.value,
              email: email.value || undefined,
              phone: phone.value || undefined,
              preferredDate: date.value,
              preferredTime: time.value,
              reason: reason.value || undefined,
            });
            ok.textContent = 'Request received — the team will confirm shortly.';
            ok.classList.remove('hidden');
            submit.setAttribute('disabled', 'true');
          } catch (e) {
            err.textContent = (e as Error).message;
            err.classList.remove('hidden');
          }
        })();
      });
      const row = el('div', 'row');
      row.appendChild(submit);
      v.appendChild(err);
      v.appendChild(ok);
      v.appendChild(row);
    });
  }

  private async handoff() {
    if (!(await this.ensureSession()) || !this.token) return;
    try {
      await requestHandoff(this.apiBase, this.token);
      this.addBubble({
        id: crypto.randomUUID(),
        role: 'ASSISTANT',
        content:
          'Your enquiry has been forwarded to a member of staff. You can keep chatting here — replies appear automatically.',
        createdAt: '',
      });
    } catch (e) {
      this.addBubble({ id: 'he', role: 'ASSISTANT', content: (e as Error).message, createdAt: '' });
    }
  }
}

const script = document.currentScript as HTMLScriptElement | null;
if (script) {
  const widget = new WymAssistWidget(script);
  void widget.boot();
}
