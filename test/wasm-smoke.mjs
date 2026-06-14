import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/cmd.wasm", import.meta.url)));
const imports = {};
for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports);
try { ex._start(); } catch {}
const enc = new TextEncoder();
const route = (s) => { const b = enc.encode(s); const p = ex.cmd_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); return ex.cmd_route(); };
let ok = true; const ck = (s, w) => { const g = route(s); if (g !== w) { console.error(`FAIL ${s}: ${g}!=${w}`); ok = false; } };
ck("setEmotion", 0); ck("wave", 1); ck("playProc", 2); ck("speak", 3); ck("reset", 4); ck("setCamera", 5); ck("bogus", -1);
console.log(ok ? "wasm OK — command routing matches native" : "FAIL"); if (!ok) process.exit(1);
