import { version } from "../version";

const docsBaseUrl = "https://ukorvl.github.io/lightweight-charts-react-components/docs/";

type IBaseErrorParameters = {
  /**
   * An operational error refers to an error that occurs during normal program operation
   * due to external factors or expected failures, not due to bugs in the code itself.
   */
  isOperational?: boolean;
  /**
   * The cause of the error, if any.
   * This can be used to provide additional context or information about the error.
   */
  cause?: Error | BaseInternalError;
  /**
   * A path to the documentation that can help resolve the error.
   * This is useful for providing users with guidance on how to fix or understand the error.
   */
  docsPath?: string;
};

class BaseInternalError extends Error {
  public isOperational: boolean;
  public override cause?: Error | BaseInternalError;

  constructor(
    message?: string,
    { isOperational = true, cause, docsPath }: IBaseErrorParameters = {}
  ) {
    super(message);

    this.name = this.constructor.name ?? "InternalError";
    this.isOperational = isOperational;
    this.cause = cause;

    this.message = `${message ?? "An error occurred"}`;

    if (docsPath) {
      this.message = `${this.message}\n\nDocs: see ${docsBaseUrl + docsPath}`;
    }

    if (version) {
      this.message = `${this.message}\n\nVersion: lightweight-charts-react-components@${version}`;
    }

    Object.setPrototypeOf(this, BaseInternalError.prototype);
  }
}

export { BaseInternalError };
