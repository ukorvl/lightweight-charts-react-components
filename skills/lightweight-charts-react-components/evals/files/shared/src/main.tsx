import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Scenario } from "./scenario";

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");
createRoot(root).render(
  <StrictMode>
    <Scenario />
  </StrictMode>
);
