const worker = new Worker(new URL("./chart.worker.ts", import.meta.url), {
  type: "module",
});

export { worker };
