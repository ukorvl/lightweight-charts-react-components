// dataWorker.js
let dataset = [];

// Generate initial mock data for a year
function generateInitialData() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  for (let i = 365; i > 0; i--) {
    dataset.push({
      timestamp: now - i * oneDay,
      value: Math.random(),
    });
  }
}

// Add new data every second
function startStreaming() {
  setInterval(() => {
    const newItem = {
      timestamp: Date.now(),
      value: Math.random(),
    };
    dataset.push(newItem);
    postMessage({ type: "new-item", payload: newItem });
  }, 1000);
}

onmessage = e => {
  const { type } = e.data;
  if (type === "init") {
    dataset = [];
    generateInitialData();
    startStreaming();
    postMessage({ type: "ready", payload: dataset });
  } else if (type === "get-data") {
    // Return current dataset
    postMessage({ type: "data", payload: dataset });
  }
};
