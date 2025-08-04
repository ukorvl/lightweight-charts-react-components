# Repository technical context

This is a modern, ESM-only React library that wraps TradingView's Lightweight Charts with idiomatic React components.
The repository contains library code and example usage.

## General Guidelines

- Use React 16.8.0+ and ESM-only syntax.
- All components are functional and use React Hooks only. No class components.
- Follow strict TypeScript typing. Avoid `any` unless absolutely necessary.
- Use named exports for all components and hooks.
- Library files are not placed in the root, but under `lib/` directory.
- The library supports tree-shaking. Ensure exports stay modular and side-effect free.
- Do not include React state or props unrelated to chart rendering.
- lightweight-charts is a peer dependency of the project.
- Only lightweight-charts 5+ version is compatible with this library.
- Library internal hooks should be named with the `use` prefix, e.g., `useChart`, `useSeries`.

## Styling & DOM

- Do not use external CSS. Library does not need any styling.
- Never use className or style props unless the chart component explicitly needs a wrapper div.

## Testing

- Tests use Vitest.
- Mock DOM and chart dependencies where needed.

## Code Style

- Use `tsx` for all component files.
- Keep props interfaces named as `ComponentNameProps`.
- Use `PascalCase` for components and `camelCase` for hooks.
- Write clear JSDoc comments for public components and utilities.
- Use `eslint` and `prettier` for code formatting and linting.
- Implement comprehensive error handling
- Write maintainable, self-documenting code
- Follow security best practices
- Ensure proper type coverage
- Avoid default exports unless absolutely necessary
