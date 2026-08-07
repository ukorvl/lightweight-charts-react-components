/**
 * Shared configuration and helpers for version-pinned README references that
 * must stay aligned with the library package version during releases.
 */

export const README_VERSION_TOKEN = "__VERSION__";

export const README_VERSION_REFERENCES = [
  `https://bundlephobia.com/package/lightweight-charts-react-components@${README_VERSION_TOKEN}`,
  `https://img.shields.io/bundlephobia/minzip/lightweight-charts-react-components/${README_VERSION_TOKEN}?cacheSeconds=31536000&colorA=1e2029&colorB=1e2029&style=flat`,
  `https://img.shields.io/bundlephobia/minzip/lightweight-charts-react-components/${README_VERSION_TOKEN}?cacheSeconds=31536000&colorA=ffcc00&colorB=ffcc00&style=flat`,
] as const;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const resolveReadmeVersionReference = (reference: string, version: string) => {
  if (!reference.includes(README_VERSION_TOKEN)) {
    throw new Error(
      `README version reference must include ${README_VERSION_TOKEN}: ${reference}`
    );
  }

  return reference.replaceAll(README_VERSION_TOKEN, version);
};

export const updateReadmeVersionReferences = (
  contents: string,
  version: string,
  references: readonly string[] = README_VERSION_REFERENCES
) => {
  let nextContents = contents;

  for (const reference of references) {
    const [prefix, suffix = ""] = reference.split(README_VERSION_TOKEN);
    const matcher = new RegExp(
      `${escapeRegex(prefix)}([^\\s"'<>]+)${escapeRegex(suffix)}`,
      "g"
    );

    if (!nextContents.match(matcher)) {
      throw new Error(`Could not find README version reference to update: ${reference}`);
    }

    nextContents = nextContents.replace(
      matcher,
      resolveReadmeVersionReference(reference, version)
    );
  }

  return nextContents;
};

export const assertReadmeVersionReferences = (
  contents: string,
  relativePath: string,
  version: string,
  references: readonly string[] = README_VERSION_REFERENCES
) => {
  for (const reference of references) {
    const expectedReference = resolveReadmeVersionReference(reference, version);

    if (!contents.includes(expectedReference)) {
      throw new Error(
        `README version reference in ${relativePath} is not pinned to ${version}: ${reference}`
      );
    }
  }
};
