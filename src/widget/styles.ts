export function buildStyles(primary: string): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

    :host { all: initial; }
    * { box-sizing: border-box; font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; }
    .hidden { display: none !important; }

    /* ── Launcher ─────────────────────────────────────────────── */
    .launcher {
      position: fixed; bottom: 20px; right: 20px; z-index: 2147483000;
      width: 52px; height: 52px; border-radius: 14px; border: none; cursor: pointer;
      background: ${primary}; color: #fff;
      box-shadow: 0 4px 14px rgba(15, 22, 18, 0.28), 0 1px 3px rgba(15, 22, 18, 0.18);
      display: flex; align-items: center; justify-content: center;
      transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s;
    }
    .launcher:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(15,22,18,.3); }
    .launcher:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 35%, transparent); }
    .launcher svg { width: 22px; height: 22px; }

    /* ── Panel ────────────────────────────────────────────────── */
    .panel {
      position: fixed; bottom: 82px; right: 20px; z-index: 2147483000;
      width: min(392px, calc(100vw - 24px)); height: min(620px, calc(100vh - 104px));
      background: #faf9f5; border-radius: 10px; overflow: hidden;
      border: 1px solid #ddd9cc;
      box-shadow: 0 18px 50px rgba(15, 22, 18, 0.22), 0 4px 14px rgba(15, 22, 18, 0.1);
      display: flex; flex-direction: column;
      transform-origin: bottom right;
      animation: rise .22s cubic-bezier(.22,1,.36,1);
    }
    @keyframes rise { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }

    /* ── Header ───────────────────────────────────────────────── */
    .head {
      background: #132017; color: #f0f4f0;
      padding: 13px 16px; display: flex; align-items: center; gap: 11px;
      border-bottom: 2px solid ${primary};
    }
    .head .mark {
      width: 34px; height: 34px; flex-shrink: 0; border-radius: 7px;
      background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16);
      display: grid; place-items: center; overflow: hidden;
      font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 16px;
    }
    .head .mark img { width: 100%; height: 100%; object-fit: cover; }
    .head .t { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 15.5px; letter-spacing: -.01em; }
    .head .s {
      display: flex; align-items: center; gap: 6px; margin-top: 2px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; opacity: .62;
    }
    .head .s::before { content: ''; width: 6px; height: 6px; background: #4cc07f; }
    .head .x {
      margin-left: auto; background: none; border: none; color: inherit; opacity: .55;
      cursor: pointer; padding: 4px; display: grid; place-items: center; border-radius: 5px;
    }
    .head .x:hover { opacity: 1; background: rgba(255,255,255,.08); }
    .head .x svg { width: 14px; height: 14px; }

    /* ── Quick actions ────────────────────────────────────────── */
    .actions {
      display: flex; gap: 6px; flex-wrap: wrap;
      padding: 9px 14px; background: #f2f0e8; border-bottom: 1px solid #e3e0d4;
    }
    .chip {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 10px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
      padding: 5px 10px; border-radius: 3px; cursor: pointer;
      border: 1px solid #cfccbd; background: #fff; color: #4d564f;
      transition: border-color .15s, color .15s;
    }
    .chip:hover { border-color: ${primary}; color: ${primary}; }
    .chip:disabled { opacity: .45; cursor: default; }
    .chip:disabled:hover { border-color: #cfccbd; color: #4d564f; }

    /* ── Thread ───────────────────────────────────────────────── */
    .body { flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 10px; }
    .body::-webkit-scrollbar { width: 8px; }
    .body::-webkit-scrollbar-thumb { background: #d8d4c7; border-radius: 4px; border: 2px solid #faf9f5; }

    .msg { max-width: 84%; padding: 9px 12px; font-size: 13.5px; line-height: 1.5;
      white-space: pre-wrap; word-break: break-word; border-radius: 10px; }
    .msg .who {
      display: block; margin-bottom: 3px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 9px; letter-spacing: .09em; text-transform: uppercase; opacity: .58;
    }
    .msg.a { align-self: flex-start; background: #fff; border: 1px solid #e4e1d5; border-bottom-left-radius: 3px; color: #1d221e; }
    .msg.u { align-self: flex-end; background: ${primary}; color: #fff; border-bottom-right-radius: 3px; }
    .msg.u.failed { opacity: .72; }
    .msg.g { align-self: flex-start; background: #edf4ee; border: 1px solid #d3e2d6; border-bottom-left-radius: 3px; color: #1d221e; }
    .msg.sys { align-self: stretch; text-align: center; background: none; border: none; padding: 2px 20px;
      font-size: 11.5px; color: #8b918a; }

    /* Typing indicator — three pulsing ticks */
    .typing { align-self: flex-start; display: flex; gap: 4px; padding: 12px 14px;
      background: #fff; border: 1px solid #e4e1d5; border-radius: 10px; border-bottom-left-radius: 3px; }
    .typing i { width: 5px; height: 5px; background: ${primary}; opacity: .3; animation: tick 1.1s infinite; }
    .typing i:nth-child(2) { animation-delay: .18s; }
    .typing i:nth-child(3) { animation-delay: .36s; }
    @keyframes tick { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }

    /* ── In-thread flow controls ──────────────────────────────── */
    .qreplies { display: flex; flex-wrap: wrap; gap: 6px; align-self: flex-start; }
    .qr {
      font-size: 12.5px; font-weight: 500; padding: 6px 11px; border-radius: 3px; cursor: pointer;
      border: 1px solid color-mix(in srgb, ${primary} 55%, #cfccbd); background: #fff; color: ${primary};
      transition: background .15s, color .15s;
    }
    .qr:hover { background: color-mix(in srgb, ${primary} 9%, #fff); }
    .qr.skip { border-color: #d7d3c6; color: #8b918a; font-weight: 400; }
    .qr.skip:hover { background: #f2f0e8; color: #5c645e; }

    .card {
      align-self: stretch; background: #fff; border: 1px solid #e0ddd0;
      border-left: 3px solid ${primary}; border-radius: 6px;
      padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;
    }
    .card .ct {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: #8b918a;
    }
    .card .dtrow { display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px; }
    .card input[type='date'], .card input[type='time'], .card input[type='text'] {
      border: 1px solid #cfccbd; border-radius: 4px; padding: 7px 9px;
      font: inherit; font-size: 12.5px; color: #1d221e; background: #fff; width: 100%;
    }
    .card input:focus { outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 16%, transparent); }
    .card .sum { font-size: 12.5px; color: #4d564f; line-height: 1.7; }
    .card .sum b { color: #1d221e; font-weight: 600; }
    .card .crow { display: flex; gap: 8px; margin-top: 2px; }
    .cbtn {
      border: none; border-radius: 4px; padding: 8px 14px; font: inherit;
      font-size: 12.5px; font-weight: 600; cursor: pointer; transition: filter .15s;
    }
    .cbtn.p { background: ${primary}; color: #fff; flex: 1; }
    .cbtn.p:hover { filter: brightness(1.08); }
    .cbtn.s { background: none; border: 1px solid #d7d3c6; color: #6b726b; }
    .cbtn.s:hover { border-color: #a9a594; color: #3d443e; }
    .cbtn:disabled { opacity: .5; cursor: default; }
    .card .cerr { font-size: 12px; color: #b3352b; }
    .cancel-flow {
      align-self: flex-start; background: none; border: none; padding: 0; cursor: pointer;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; color: #a5aaa3;
    }
    .cancel-flow:hover { color: #b3352b; }

    /* ── Composer ─────────────────────────────────────────────── */
    .composer { display: flex; gap: 8px; padding: 11px 13px; border-top: 1px solid #e4e1d5; background: #fff; }
    .composer input {
      flex: 1; min-width: 0; border: 1px solid #d7d3c6; border-radius: 4px;
      padding: 9px 11px; font: inherit; font-size: 13.5px; color: #1d221e; background: #fff;
    }
    .composer input:focus { outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 16%, transparent); }
    .composer input::placeholder { color: #a5aaa2; }
    .send {
      width: 38px; flex-shrink: 0; border: none; border-radius: 4px; cursor: pointer;
      background: ${primary}; color: #fff; display: grid; place-items: center;
      transition: filter .15s;
    }
    .send:hover { filter: brightness(1.08); }
    .send:disabled { opacity: .45; cursor: default; }
    .send svg { width: 16px; height: 16px; }

    .foot {
      padding: 7px; text-align: center; background: #fff; border-top: 1px solid #eeece2;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: #b5b2a5;
    }

    @media (max-width: 460px) {
      .panel { right: 8px; bottom: 76px; width: calc(100vw - 16px); }
      .launcher { right: 12px; bottom: 12px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .panel { animation: none; }
      .launcher, .launcher:hover { transition: none; transform: none; }
      .typing i { animation: none; opacity: .6; }
    }
  `;
}
