import { Stack, Typography } from "@mui/material";
import type { FallbackProps } from "react-error-boundary";

const ErrorFallback = ({ error }: FallbackProps) => {
  const { message } = error;

  return (
    <Stack justifyContent="center" alignItems="center" flexGrow={1} textAlign="center">
      <Typography variant="h6" color="info">
        An error occurred while rendering:
      </Typography>
      <Typography color="error" fontFamily="Roboto Mono, monospace" mt={1}>
        {message}
      </Typography>
    </Stack>
  );
};

export { ErrorFallback };
