import Box from "@mui/material/Box";
import { Suspense, lazy } from "react";
import type { CodeSnippetProps } from "./CodeSnippet";

const CodeSnippet = lazy(() =>
  import("./CodeSnippet").then(module => ({ default: module.CodeSnippet }))
);

const CodeSnippetFallback = ({ value }: Pick<CodeSnippetProps, "value">) => {
  return (
    <Box
      component="pre"
      sx={{
        overflowX: "auto",
        margin: 0,
        padding: 2,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <code>{value.trim()}</code>
    </Box>
  );
};

const CodeSnippetLazy = (props: CodeSnippetProps) => {
  return (
    <Suspense fallback={<CodeSnippetFallback value={props.value} />}>
      <CodeSnippet {...props} />
    </Suspense>
  );
};

export { CodeSnippetLazy };
