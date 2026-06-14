# fizz-command-applier

Fizz の **command 振り分けコア**。wire-protocol の avatar Command の type を、それを
処理するサブシステム分類(`face` / `pose` / `motion` / `speech` / `control` / `scene`)
に対応付ける。各ハンドラ(VRM 適用 / scene 操作)はブラウザ専用だが、**どの type が
どのサブシステムか**という振り分け表は純粋なので Almide に集約=単一の正本。
移植元: openaituber `src/vrm/control.ts` の `applyCommand` スイッチ。

## subsystem id

`0 face` / `1 pose` / `2 motion` / `3 speech` / `4 control` / `5 scene` / `-1 unknown`

## native

```sh
almide build src/main.almd -o build/fizz-command-applier
printf 'setEmotion\nplayProc\nspeak\n' | ./build/fizz-command-applier
# setEmotion	face / playProc	motion / speak	speech
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/cmd.wasm
```

`cmd_alloc(len)` で type を線形メモリに書き、`cmd_route() -> Float`(subsystem id、
-1=unknown)。JS は id から自前ハンドラ表を引く。グルー例
[`browser/command-driver.js`](./browser/command-driver.js)。CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
