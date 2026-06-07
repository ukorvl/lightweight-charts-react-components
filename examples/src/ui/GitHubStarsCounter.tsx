import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { colors } from "@/common/colors";

const GitHubStarsCounter = () => {
  const { VITE_GITHUB_API_REPO_URL, VITE_GITHUB_STARGAZERS_URL } = import.meta.env;
  const [stars, setStars] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(VITE_GITHUB_API_REPO_URL, { signal })
      .then(res => {
        if (!res.ok) {
          throw new Error("network error");
        }

        return res.json();
      })
      .then(data => {
        setStars(data.stargazers_count);
        setError(null);
      })
      .catch(() => {
        setError("failed to fetch");
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Typography
      sx={{
        fontSize: "0.8rem",
        textWrap: "nowrap",
        color: colors.gray,
      }}
    >
      GitHub stars counter:{" "}
      {error ? (
        error
      ) : stars !== null ? (
        <Link
          underline="hover"
          href={VITE_GITHUB_STARGAZERS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {stars}
        </Link>
      ) : (
        "loading..."
      )}
    </Typography>
  );
};

export { GitHubStarsCounter };
