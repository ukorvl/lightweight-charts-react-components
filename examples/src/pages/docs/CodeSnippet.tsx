import { javascript } from "@codemirror/lang-javascript";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";

type CodeLanguage = "javascript" | "jsx" | "typescript" | "tsx" | "text";

type CodeSnippetProps = {
  value: string;
  language?: CodeLanguage;
};

const basicSetup = {
  autocompletion: false,
  foldGutter: false,
  highlightActiveLine: false,
  highlightActiveLineGutter: false,
  highlightSelectionMatches: false,
  lineNumbers: true,
  searchKeymap: false,
};

const getExtensions = (language: CodeLanguage) => {
  switch (language) {
    case "tsx":
      return [javascript({ jsx: true, typescript: true })];
    case "typescript":
      return [javascript({ typescript: true })];
    case "jsx":
      return [javascript({ jsx: true })];
    case "javascript":
      return [javascript()];
    case "text":
    default:
      return [];
  }
};

const CodeSnippet = ({ value, language = "tsx" }: CodeSnippetProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        borderRadius: 2,
        "& .cm-editor": {
          backgroundColor: "rgba(255,255,255,0.04)",
        },
        "& .cm-content, & .cm-gutterElement": {
          fontFamily: '"Roboto Mono", monospace',
          fontSize: "0.875rem",
        },
        "& .cm-scroller": {
          overflow: "auto",
        },
        "& .cm-gutters": {
          minHeight: "100%",
          backgroundColor: alpha(theme.palette.background.paper, 0.65),
          borderRight: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        },
        "& .cm-focused": {
          outline: "none",
        },
        "& .cm-activeLine, & .cm-activeLineGutter": {
          backgroundColor: "transparent",
        },
        "& .cm-selectionBackground, & .cm-content ::selection": {
          backgroundColor: `${alpha(theme.palette.info.main, 0.22)} !important`,
        },
      }}
    >
      <CodeMirror
        basicSetup={basicSetup}
        editable={false}
        height="auto"
        readOnly
        theme="dark"
        value={value.trim()}
        extensions={getExtensions(language)}
      />
    </Box>
  );
};

export { CodeSnippet };
export type { CodeLanguage, CodeSnippetProps };
