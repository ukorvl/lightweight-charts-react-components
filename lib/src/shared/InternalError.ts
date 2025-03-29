import { version } from "../../package.json";

const docsBaseUrl =
  "https://tradingview.github.io/lightweight-charts/docs/4.2";

type IBaseErrorParameters = {
  isOperational?: boolean;
  cause?: Error | BaseInternalError;
  docsPath?: string;
};

class BaseInternalError extends Error {
  public isOperational: boolean;
  public cause?: Error | BaseInternalError;

  constructor(
    message?: string,
    { isOperational = true, cause, docsPath }: IBaseErrorParameters = {},
  ) {
    super(message);

    this.name = this.constructor.name ?? "InternalError";
    this.isOperational = isOperational;
    this.cause = cause;

    this.message = `${message ?? "An error occurred"}`;

    if (docsPath) {
      this.message = `${this.message}
      Docs: see ${docsBaseUrl + docsPath}`;
    }

    if (version) {
      this.message = `${this.message}
      Version: lightweight-charts-react-components/${version}`;
    }

    Object.setPrototypeOf(this, BaseInternalError.prototype);
  }
}

export { BaseInternalError };
