import { matchMedia } from "mock-match-media";

// Lightweight Charts listens for device pixel ratio changes through the canvas window.
window.matchMedia ??= matchMedia;
