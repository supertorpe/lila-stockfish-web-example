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

const setupStockfish = (): Promise<StockfishWeb> => {
    return new Promise<StockfishWeb>((resolve, reject) => {
        import('lila-stockfish-web/sf16-7.js').then((makeModule: any) => {
            makeModule
                .default({
                    wasmMemory: sharedWasmMemory(1536!),
                    onError: (msg: string) => reject(new Error(msg)),
                    locateFile: (name: string) => `assets/stockfish/${name}`,
                })
                .then(async (instance: StockfishWeb) => {
                    instance;
                    const response = await fetch(`assets/stockfish/${instance.getRecommendedNnue()}`);
                    const buffer = await response.arrayBuffer();
                    const uint8Array = new Uint8Array(buffer);
                    instance.setNnueBuffer(uint8Array);
                    resolve(instance);
                });
        });
    });
};

setupStockfish().then((stockfish: StockfishWeb) => {
    stockfish.onError = (msg: string) => { console.log(msg); }
    stockfish.listen = (data: string) => { console.log(data); }
    stockfish.uci('uci');
    stockfish.uci('quit');
}).catch((error: Error) => {
    console.log(error.message);
});

export { };