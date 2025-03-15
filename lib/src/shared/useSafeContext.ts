import { Context, useContext } from "react";

export const useSafeContext = <T extends unknown>(context: Context<T>) => {
  const currentContextValue = useContext(context);

  if (!currentContextValue) {
    const ctxName = context.name;
    throw new Error(`${ctxName} not found. You can access context value only inside its Provider.`);
  }

  return currentContextValue;
};
