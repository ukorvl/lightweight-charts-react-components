const typedObjectKeys = <T extends object>(obj: T): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>;
};

const typedObjectEntries = <T extends object>(obj: T): Array<[keyof T, T[keyof T]]> => {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
};

const createStubArray = (length: number) => new Array(length).fill(0);

const encodeInlineSvg = (inlineSvg: string) =>
  `data:image/svg+xml,${encodeURIComponent(inlineSvg)}`;

const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  return Object.prototype.toString.call(val) === "[object Object]";
};

const deepMergePlainObjects = <
  T extends Record<string, unknown>,
  O extends Record<string, unknown>,
>(
  target: T,
  source: O
): T | O => {
  if (!isPlainObject(target)) {
    throw new TypeError(`Target must be a plain object, got ${typeof target}`);
  }

  if (!isPlainObject(source)) {
    throw new TypeError(`Source must be a plain object, got ${typeof source}`);
  }

  const result = structuredClone(target) as Record<string, unknown>;
  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = target[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMergePlainObjects(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }

  return result as T | O;
};

export {
  typedObjectKeys,
  createStubArray,
  encodeInlineSvg,
  typedObjectEntries,
  deepMergePlainObjects,
};
