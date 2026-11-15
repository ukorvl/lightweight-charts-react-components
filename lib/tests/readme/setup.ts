import "@testing-library/jest-dom/vitest";
import "vitest-canvas-mock";
import "../setupMatchMedia";
import { extractSnippets } from "./utils";

extractSnippets();
