const typedObjectKeys = <T extends object>(obj: T): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>;
};

const createStubArray = (length: number) => new Array(length).fill(0);

const encodeInlineSvg = (inlineSvg: string) =>
  `data:image/svg+xml,${encodeURIComponent(inlineSvg)}`;

export { typedObjectKeys, createStubArray, encodeInlineSvg };
