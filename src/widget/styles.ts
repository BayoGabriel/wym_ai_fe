export function buildStyles(primary: string): string {
  return `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; }
    .launcher {
      position: fixed; bottom: 20px; right: 20px; z-index: 2147483000;
      width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
      background: ${primary}; color: #fff; font-size: 24px; line-height: 1;
      box-shadow: 0 6px 20px rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center;
    }
    .panel {
      position: fixed; bottom: 88px; right: 20px; z-index: 2147483000;
      width: min(380px, calc(100vw - 32px)); height: min(560px, calc(100vh - 120px));
      background: #fff; border-radius: 14px; overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,.22); display: flex; flex-direction: column;
      border: 1px solid #e5e5e0;
    }
    .hidden { display: none !important; }
    .head { background: ${primary}; color: #fff; padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
    .head img { width: 30px; height: 30px; border-radius: 6px; object-fit: cover; background: #fff; }
    .head .t { font-weight: 650; font-size: 15px; }
    .head .s { font-size: 12px; opacity: .85; }
    .body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; background: #faf9f6; }
    .msg { max-width: 82%; padding: 9px 12px; border-radius: 12px; font-size: 14px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
    .msg.u { align-self: flex-end; background: ${primary}; color: #fff; border-bottom-right-radius: 4px; }
    .msg.a { align-self: flex-start; background: #fff; border: 1px solid #e8e6e0; border-bottom-left-radius: 4px; }
    .msg.g { align-self: flex-start; background: #eef6f1; border: 1px solid #d5e8dd; border-bottom-left-radius: 4px; }
    .msg .who { display: block; font-size: 11px; opacity: .7; margin-bottom: 3px; }
    .typing { align-self: flex-start; color: #888; font-size: 13px; font-style: italic; padding: 4px 8px; }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; padding: 8px 14px; border-top: 1px solid #eee; background: #fff; }
    .chip { font-size: 12px; padding: 5px 10px; border-radius: 999px; border: 1px solid ${primary}; background: #fff; color: ${primary}; cursor: pointer; }
    .chip:hover { background: ${primary}; color: #fff; }
    .composer { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid #eee; background: #fff; }
    .composer input { flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 9px 12px; font-size: 14px; outline: none; }
    .composer input:focus { border-color: ${primary}; }
    .composer button { border: none; border-radius: 8px; background: ${primary}; color: #fff; padding: 0 16px; font-size: 14px; cursor: pointer; }
    .foot { text-align: center; font-size: 11px; color: #aaa; padding: 6px; background: #fff; }
    .form-view { flex: 1; overflow-y: auto; padding: 16px; background: #fff; display: flex; flex-direction: column; gap: 10px; }
    .form-view h3 { margin: 0 0 4px; font-size: 15px; }
    .form-view label { font-size: 12.5px; color: #444; display: flex; flex-direction: column; gap: 4px; }
    .form-view input, .form-view select, .form-view textarea { border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px; font-size: 14px; }
    .form-view .row { display: flex; gap: 8px; margin-top: 6px; }
    .btn { border: none; border-radius: 8px; padding: 9px 14px; font-size: 14px; cursor: pointer; }
    .btn.p { background: ${primary}; color: #fff; flex: 1; }
    .btn.s { background: #eee; color: #333; }
    .note { font-size: 12px; color: #777; }
    .err { font-size: 12.5px; color: #b3261e; background: #fdeceb; padding: 8px 10px; border-radius: 8px; }
    .ok { font-size: 12.5px; color: #0b5c40; background: #e7f4ec; padding: 8px 10px; border-radius: 8px; }
  `;
}
