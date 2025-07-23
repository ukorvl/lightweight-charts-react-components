import { type Context, useContext } from "react";
import { BaseInternalError } from "./InternalError";

const useSafeContext = <T>(context: Context<T>, errorMessage?: string) => {
  const currentContextValue = useContext(context);

  if (!currentContextValue) {
    const ctxName = context.name ?? context.displayName ?? "Context";
    throw new BaseInternalError(errorMessage ?? `${ctxName} not found.`, {
      isOperational: true,
    });
  }

  return currentContextValue;
};

export { useSafeContext };
