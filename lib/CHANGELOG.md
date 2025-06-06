# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- add standalone version of the library

## [0.4.1] - 2025-06-06
### Changed
- migrate to `classic` jsx transform from `react-jsx`

## [0.4.0] - 2025-06-03
### Added
- add `SeriesPrimitive` component
### Changed
- custom `SeriesType` is replaced with lightweight-charts `SeriesType`

## [0.3.5] - 2025-05-19
### Feat
- add chart `onDblClick` prop to handle double-click event subscription
### Fix
- fix `PriceLine` price property change does not apply to price line on the chart

## [0.3.4] - 2025-05-09
### Fix
- fix time scale options not being applied on init
### Feat
- add `<TimeScaleFitContentTrigger>` component

## [0.3.3] - 2025-04-21
### Feat
- drop commonjs support

## [0.3.2] - 2025-04-21
### Fix
- fix typo in require exports in package.json

## [0.3.1] - 2025-04-21
### Fix
- fix chart component incorrect typngs (#64)

## [0.3.0] - 2025-04-21
### Feat
- add `containerProps` and `options` to Chart props
- add `isPane` series prop

## [0.2.1] - 2025-04-08
### Fix
- apply price scale options after changing price scale id

## [0.2.0] - 2025-04-05
### Fix 
- fix rendering in strict mode

## [0.1.2] - 2025-04-05
### Feat
- add WatermarkText and WatermarkImage components

## [0.1.1] - 2025-04-03
### Fix
- fix empty markers on init issue
### Feat
- make series and markers reactive by default

## [0.1.0] - 2025-03-31
### Feat
- migrate to lightweight-charts v5
- add range switcher to examples

### Fix
- fix typescript series typings and add generic forwardref

## [0.0.4] - 2025-03-29
### Feat
- add custom series
