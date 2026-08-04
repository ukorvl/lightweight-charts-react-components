import type { RefObject, Ref } from "react";

export const assignRef = <T>(ref: Ref<T> | undefined, value: T | null): void => {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as RefObject<T | null>).current = value;
};
