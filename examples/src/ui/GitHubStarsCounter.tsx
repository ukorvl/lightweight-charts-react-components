import { Link, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { colors } from "@/common/colors";

const GitHubStarsCounter = () => {
  const { VITE_GITHUB_API_REPO_URL, VITE_GITHUB_STARGAZERS_URL } = import.meta.env;
  const [stars, setStars] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(VITE_GITHUB_API_REPO_URL)
      .then(res => res.json())
      .then(data => {
        setStars(data.stargazers_count);
      })
      .catch(() => {
        setError("Failed to fetch");
      });
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
        "Loading..."
      )}
    </Typography>
  );
};

export { GitHubStarsCounter };
