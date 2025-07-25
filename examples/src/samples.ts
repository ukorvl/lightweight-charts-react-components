type SampleConfig = {
  github?: string;
  codesandbox?: string;
  stackblitz?: string;
  terminal?: string;
};

const repoSandboxSamplesPath =
  "ukorvl/lightweight-charts-react-components/tree/main/examples/src/samples";

const githubSamplesLocation = `https://github.com/${repoSandboxSamplesPath}`;

const codesandboxBaseUrl = import.meta.env.VITE_CODESANDBOX_BASE_URL;
const stackblitzBaseUrl = import.meta.env.VITE_STACKBLITZ_BASE_URL;

const codeSandboxUrlBase = `${codesandboxBaseUrl}/github/${repoSandboxSamplesPath}`;
const stackBlitzUrlBase = `${stackblitzBaseUrl}/github/${repoSandboxSamplesPath}`;

const samplesLinks = {
  BasicSeries: {
    github: `${githubSamplesLocation}/BasicSeries`,
    codesandbox: `${codeSandboxUrlBase}/BasicSeries/sandbox`,
    stackblitz: `${stackBlitzUrlBase}/BasicSeries/sandbox`,
  },
  CustomSeries: {
    github: `${githubSamplesLocation}/CustomSeries`,
    codesandbox: "",
    stackblitz: "",
  },
  RangeSwitcher: {
    github: `${githubSamplesLocation}/RangeSwitcher`,
    codesandbox: "",
    stackblitz: "",
  },
  Markers: {
    github: `${githubSamplesLocation}/Markers`,
    codesandbox: "",
    stackblitz: "",
  },
  Watermark: {
    github: `${githubSamplesLocation}/Watermark`,
    codesandbox: "",
    stackblitz: "",
  },
  Legend: {
    github: `${githubSamplesLocation}/Legend`,
    codesandbox: "",
    stackblitz: "",
  },
  CompareSeries: {
    github: `${githubSamplesLocation}/CompareSeries`,
    codesandbox: "",
    stackblitz: "",
  },
  Scales: {
    github: `${githubSamplesLocation}/Scales`,
    codesandbox: "",
    stackblitz: "",
  },
  Tooltips: {
    github: `${githubSamplesLocation}/Tooltips`,
    codesandbox: "",
    stackblitz: "",
  },
  Panes: {
    github: `${githubSamplesLocation}/Panes`,
    codesandbox: `${codeSandboxUrlBase}/Panes/sandbox`,
    stackblitz: `${stackBlitzUrlBase}/Panes/sandbox`,
  },
  InfiniteData: {
    github: `${githubSamplesLocation}/InfiniteData`,
    codesandbox: "",
    stackblitz: "",
  },
  PriceLines: {
    github: `${githubSamplesLocation}/PriceLines`,
    codesandbox: "",
    stackblitz: "",
  },
  Primitives: {
    github: `${githubSamplesLocation}/Primitives`,
    codesandbox: "",
    stackblitz: "",
  },
  RealTime: {
    github: `${githubSamplesLocation}/RealTime`,
    codesandbox: `${codeSandboxUrlBase}/RealTime/sandbox`,
    stackblitz: `${stackBlitzUrlBase}/RealTime/sandbox`,
  },
} as const;

export { samplesLinks, type SampleConfig };
