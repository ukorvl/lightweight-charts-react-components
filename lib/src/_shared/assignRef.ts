import type { RefObject, Ref } from "react";

export const assignRef = <T>(
  ref: Ref<T> | undefined,
  value: T | null
): void | (() => void) => {
  if (typeof ref === "function") {
    return ref(value);
  }

  if (ref && typeof ref === "object") {
    (ref as RefObject<T | null>).current = value;
  }
};
