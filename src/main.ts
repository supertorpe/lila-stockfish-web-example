const sharedWasmMemory = (lo: number, hi = 32767): WebAssembly.Memory => {
    let shrink = 4; // 32767 -> 24576 -> 16384 -> 12288 -> 8192 -> 6144 -> etc
    while (true) {
        try {
            return new WebAssembly.Memory({ shared: true, initial: lo, maximum: hi });
        } catch (e) {
            if (hi <= lo || !(e instanceof RangeError)) throw e;
            hi = Math.max(lo, Math.ceil(hi - hi / shrink));
            shrink = shrink === 4 ? 3 : 4;
        }
    }
};

import('lila-stockfish-web/linrock-nnue-7.js').then((module: any) => {
    module.default({
        wasmMemory: sharedWasmMemory(1536),
        onError: (msg: string) => console.log(msg),
        //locateFile: (_name: string) => 'assets/stockfish/linrock-nnue-7.worker.js',
    });
});

export { };