# Contributing to Lightweight Charts React Components

Thank you for your interest in contributing to **Lightweight Charts React Components**! We appreciate your help in improving and maintaining this project.

## Getting Started

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page and clone your fork.

   ```sh
   git clone https://github.com/ukorvl/lightweight-charts-react-components.git
   cd lightweight-charts-react-components
   ```

2. **Install Dependencies**: Align your local tooling with the repository requirements first:

   ```sh
   nvm use
   npm -v
   ```

   The repository expects **Node.js 24+** and **npm 11.10.0 or newer**.

   Then install dependencies:

   ```sh
   npm install
   ```

   Note, that the project uses npm workspaces, so all dependencies will be installed in the root `node_modules` folder.

3. **Create a Branch**: Use a meaningful branch name related to your changes.
   ```sh
   git checkout -b feature/my-new-feature
   ```

## Development Workflow

### Running the Project

- Start the development environment:
  ```sh
  npm run dev # Runs the library and the examples website in watch mode
  ```
- Run tests:
  ```sh
  npm run test:all # Runs tests across all workspaces
  ```
- Build the library:
  ```sh
  npm run build # Builds the library and the exmaples website
  ```

### Code Guidelines

- Follow the existing code style and conventions.
- Ensure your changes pass ESLint, Prettier and TypeScript checks:
  ```sh
  npm run lint
  ```
- Keep PRs focused and provide clear descriptions.

## Submitting Changes

1. **Commit Your Changes**:
   ```sh
   git commit -m "feat: Add new feature"
   ```
   Note, that we use commitlint to enforce conventional commit messages.
2. **Ensure version and changelog**:
   If you made a user-visible change, add a new entry to the `CHANGELOG.md` file if necessary under "Unreleased" section.
3. **Push to Your Fork**:
   ```sh
   git push origin feature/my-new-feature
   ```
4. **Open a Pull Request**:
   - Go to the original repository.
   - Click "New Pull Request".
   - Select your branch and submit the PR with a clear description.
5. **Release**:
   Maintainers release from a `release-vX.Y.Z` branch: a single `chore: vX.Y.Z` commit with the version bump and the new `CHANGELOG.md` section, a release PR to `main`, and an annotated `vX.Y.Z` tag on that commit. The version follows [Semantic Versioning](https://semver.org/).
   Then run the `Release` workflow in the GitHub Actions tab on the `vX.Y.Z` tag (a branch ref fails its tag check). It publishes to npm and JSR, so a failed release never reaches `main`; merge the release PR with a merge commit after it succeeds.
   `node scripts/release.mts` automates these steps and backs the `release-manager` agent skill.

## Issues and Feature Requests

- Use the **GitHub Issues** tab to report bugs and request features.

## License

By contributing, you agree that your code will be licensed under the [MIT License](https://github.com/ukorvl/lightweight-charts-react-components/blob/main/lib/LICENSE).

Thank you for your contributions! 🎉
