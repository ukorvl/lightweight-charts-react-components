/*
 * Copyright 2024 lightweight-charts
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import type { CustomData } from "lightweight-charts";

export interface GroupedBarsData extends CustomData {
  customValues: {
    values: number[];
  };
}
