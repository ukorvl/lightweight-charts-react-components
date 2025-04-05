/* eslint-disable no-extra-boolean-cast */
/*
 * Copyright 2024 lightweight-charts
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import { defaultOptions } from "./options";
import { GroupedBarsSeriesRenderer } from "./renderer";
import type { GroupedBarsData } from "./GroupedBarsData";
import type { GroupedBarsSeriesOptions } from "./options";
import type {
  CustomSeriesPricePlotValues,
  ICustomSeriesPaneView,
  PaneRendererCustomData,
  WhitespaceData,
  Time,
} from "lightweight-charts";

export class GroupedBarsSeries<TData extends GroupedBarsData>
  implements ICustomSeriesPaneView<Time, TData, GroupedBarsSeriesOptions>
{
  _renderer: GroupedBarsSeriesRenderer<TData>;

  constructor() {
    this._renderer = new GroupedBarsSeriesRenderer();
  }

  priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
    const { values } = plotRow.customValues ?? { values: [] };
    return [0, ...values];
  }

  isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
    return !Boolean((data as Partial<TData>).customValues?.values?.length);
  }

  renderer(): GroupedBarsSeriesRenderer<TData> {
    return this._renderer;
  }

  update(
    data: PaneRendererCustomData<Time, TData>,
    options: GroupedBarsSeriesOptions
  ): void {
    this._renderer.update(data, options);
  }

  defaultOptions() {
    return defaultOptions;
  }
}
