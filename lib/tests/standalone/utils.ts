const waitForGlobal = (name: string, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const interval = 50;
    const maxAttempts = timeout / interval;
    let attempts = 0;

    const handle = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any)[name]) {
        clearInterval(handle);
        resolve();
      } else if (++attempts >= maxAttempts) {
        clearInterval(handle);
        reject(new Error(`${name} not found on window within ${timeout}ms`));
      }
    }, interval);
  });
};

const waitForGlobalSymbols = async (
  symbols: string[],
  timeout?: number
): Promise<void> => {
  const promises = symbols.map(symbol => waitForGlobal(symbol, timeout));
  await Promise.all(promises);
};

const prepareGlobalEnvironment = async (): Promise<void> => {
  await waitForGlobalSymbols([
    "React",
    "ReactDOM",
    "LightweightChartsReactComponents",
    "LightweightCharts",
  ]);
};

export { prepareGlobalEnvironment };
