import { lazy } from "react";

type ComponentImportType = () => Promise<{ default: React.ComponentType }>;

const sessionKey = "lazyWithRetry";

const lazyWithRetry = (componentImport: ComponentImportType, name: string) => {
  return lazy(async () => {
    const hasRefreshed = sessionStorage.getItem(`${sessionKey}-${name}`) || "false";

    try {
      sessionStorage.setItem(`${sessionKey}-${name}`, "false");
      return await componentImport();
    } catch (error) {
      if (hasRefreshed === "false") {
        sessionStorage.setItem(`${sessionKey}-${name}`, "true");
        window.location.reload();
      }

      if (hasRefreshed === "true") {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new Error("chunkLoadError: " + errorMessage);
      }
    }
    return await componentImport();
  });
};

export { lazyWithRetry };
