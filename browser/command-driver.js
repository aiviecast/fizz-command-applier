// command-driver.js — command type を subsystem に分類するグルー例 (分類=wasm、適用=JS)。
const SUBSYS = ["face", "pose", "motion", "speech", "control", "scene"];
export async function loadCommandRouter(wasmUrl) {
  const bytes = await (await fetch(wasmUrl)).arrayBuffer();
  const mod = await WebAssembly.compile(bytes);
  const imports = {};
  for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports);
  try { ex._start(); } catch {}
  const enc = new TextEncoder();
  return {
    // command type → subsystem 名 (未知は null)
    route(type) {
      const b = enc.encode(type);
      const p = ex.cmd_alloc(b.length);
      new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b);
      const id = ex.cmd_route();
      return id < 0 ? null : SUBSYS[id];
    },
  };
}
