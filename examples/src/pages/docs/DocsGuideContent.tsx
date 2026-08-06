import Box from "@mui/material/Box";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { CodeLanguage } from "./CodeSnippet";
import type { Root } from "react-dom/client";

type DocsGuideContentProps = {
  html: string;
  sx: object;
};

const getCodeLanguage = (codeElement: HTMLElement): CodeLanguage => {
  const languageClass = Array.from(codeElement.classList).find(className =>
    className.startsWith("language-")
  );

  switch (languageClass?.slice("language-".length)) {
    case "js":
    case "javascript":
      return "javascript";
    case "jsx":
      return "jsx";
    case "ts":
    case "typescript":
      return "typescript";
    case "tsx":
      return "tsx";
    default:
      return "text";
  }
};

const DocsGuideContent = ({ html, sx }: DocsGuideContentProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const contentElement = contentRef.current;
    const roots: Root[] = [];
    let disposed = false;

    if (!contentElement) {
      return;
    }

    void import("./CodeSnippet").then(({ CodeSnippet }) => {
      if (disposed) {
        return;
      }

      const codeBlocks = contentElement.querySelectorAll<HTMLElement>("pre > code");

      for (const codeBlock of codeBlocks) {
        const preElement = codeBlock.parentElement;

        if (!preElement) {
          continue;
        }

        const mountElement = document.createElement("div");
        preElement.replaceWith(mountElement);

        const root = createRoot(mountElement);
        root.render(
          <CodeSnippet
            language={getCodeLanguage(codeBlock)}
            value={codeBlock.textContent ?? ""}
          />
        );
        roots.push(root);
      }
    });

    return () => {
      disposed = true;

      for (const root of roots) {
        root.unmount();
      }
    };
  }, [html]);

  return <Box ref={contentRef} sx={sx} dangerouslySetInnerHTML={{ __html: html }} />;
};

export { DocsGuideContent };
