import StockfishWeb from 'lila-stockfish-web';

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

const makeModule = await import('lila-stockfish-web/linrock-nnue-7.js');
const stockfish: StockfishWeb = await new Promise((resolve, reject) => {
    makeModule
    .default({
        wasmMemory: sharedWasmMemory(1536!),
        onError: (msg: string) => reject(new Error(msg)),
        locateFile: (name: string) => `assets/stockfish/${name}`,
    })
    .then(resolve)
    .catch(reject);
});

const response = await fetch(`assets/stockfish/${stockfish.getRecommendedNnue()}`);
const buffer = await response.arrayBuffer();
const uint8Array = new Uint8Array(buffer);
stockfish.setNnueBuffer(uint8Array);
stockfish.onError = (msg: string) => { console.log(msg); }
stockfish.listen = (data: string) => { console.log(data); }

stockfish.postMessage('uci');

stockfish.postMessage('quit');

export { };