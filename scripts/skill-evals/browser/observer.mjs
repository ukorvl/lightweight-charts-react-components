// Browser observation only: forwards creation/removal to real Lightweight Charts.
// The verifier supplies @eval/native as an alias to the installed public entry.
import * as native from "@eval/native";
export * from "@eval/native";

window.__skillEvalCharts = [];
function capture(chart, host) {
  const entry = { chart, host, series: [], removed: false };
  window.__skillEvalCharts.push(entry);
  const add = chart.addSeries.bind(chart);
  chart.addSeries = (...args) => {
    const series = add(...args);
    entry.series.push(series);
    return series;
  };
  const removeSeries = chart.removeSeries.bind(chart);
  chart.removeSeries = series => {
    removeSeries(series);
    entry.series = entry.series.filter(value => value !== series);
  };
  const remove = chart.remove.bind(chart);
  chart.remove = () => {
    entry.removed = true;
    remove();
  };
  return chart;
}
export function createChart(host, options) {
  return capture(native.createChart(host, options), host);
}
export function createChartEx(host, behavior, options) {
  return capture(native.createChartEx(host, behavior, options), host);
}
