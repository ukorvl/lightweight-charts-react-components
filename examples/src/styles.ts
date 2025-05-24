import { keyframes } from "@mui/material";

const gradientAnimation = keyframes`
  0%   { background-position: 50% 0; }
  12.5% { background-position: 70% 0; }
  25%  { background-position: 75% 0; }
  37.5% { background-position: 70% 0; }
  50%  { background-position: 60% 0; }
  62.5% { background-position: 55% 0; }
  75%  { background-position: 50% 0; }
  87.5% { background-position: 35% 0; }
  100% { background-position: 20% 0; }
`;

const logoKeyframes = keyframes`
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.1);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.06);
  }
  70% {
    transform: scale(1);
  }
`;

const textBgKeyframes = keyframes`
  0% {
    background-position: 100% 50%;
    background-size: 200% 200%;
  }
  100% {
    background-position: 0% 50%;
    background-size: 100% 100%;
  }
`;

export { gradientAnimation, logoKeyframes, textBgKeyframes };
