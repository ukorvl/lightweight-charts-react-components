/*
 * Copyright 2024 lightweight-charts
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  CustomSeriesOptions,
  customSeriesDefaultOptions,
} from "lightweight-charts";

export interface GroupedBarsSeriesOptions extends CustomSeriesOptions {
  colors: readonly string[];
}

export const defaultOptions: GroupedBarsSeriesOptions = {
  ...customSeriesDefaultOptions,
  colors: [
    "#2962FF",
    "#E1575A",
    "#F28E2C",
    "rgb(164, 89, 209)",
    "rgb(27, 156, 133)",
  ],
} as const;
