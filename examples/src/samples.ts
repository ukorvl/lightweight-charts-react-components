const githubSamplesLocation =
  "https://github.com/ukorvl/lightweight-charts-react-components/tree/main/examples/src/samples";
const codesandboxBaseUrl = "https://codesandbox.io/s";
const codesandboxBaseGithubUrl = `${codesandboxBaseUrl}/github/ukorvl/lightweight-charts-react-components/tree/main/examples/src/samples`;

const samplesLinks = {
  BasicSeries: {
    github: `${githubSamplesLocation}/BasicSeries`,
    codesandbox: `${codesandboxBaseGithubUrl}/BasicSeries/codesandbox`,
    stackblitz: "",
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
    codesandbox: "",
    stackblitz: "",
  },
} as const;

export { samplesLinks };
