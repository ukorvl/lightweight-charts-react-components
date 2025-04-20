let panesCount = 0;

const incrementPaneCount = () => {
  panesCount += 1;
  return panesCount;
};

const decrementPaneCount = () => {
  if (panesCount !== 0) {
    panesCount -= 1;
  }
  return panesCount;
};

export { panesCount, incrementPaneCount, decrementPaneCount };
