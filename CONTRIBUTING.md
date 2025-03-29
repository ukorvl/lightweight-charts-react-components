# Contributing to Lightweight Charts React Components

Thank you for your interest in contributing to **Lightweight Charts React Components**! We appreciate your help in improving and maintaining this project.

## Getting Started

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page and clone your fork.
   ```sh
   git clone https://github.com/ukorvl/lightweight-charts-react-components.git
   cd lightweight-charts-react-components
   ```

2. **Install Dependencies**: Ensure you have Node.js and npm installed, then run:
   ```sh
   npm install
   ```
   Note, that the project use npm workspaces, so all dependencies will be installed in the root `node_modules` folder.

3. **Create a Branch**: Use a meaningful branch name related to your changes.
   ```sh
   git checkout -b feature/my-new-feature
   ```

## Development Workflow

### Running the Project
- Start the development environment:
  ```sh
  npm run dev # Builds the library and watches for changes
  ```
- Run tests:
  ```sh
  npm run test # Runs tests across all workspaces
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
   If made a change that affects the public API, update the version in the `package.json` file and add a new entry to the `CHANGELOG.md` file.
   There is a script [fill-changelog](./scripts/fill-changelog.sh) that can help you to automatically, but note that it uses the commit history to generate the changelog, so make sure that your commits messages are explicit and follow the conventional commit format.
   ```sh
   npm run changelog
   ```
   Changleog can be filled manually as well.
3. **Push to Your Fork**:
   ```sh
   git push origin feature/my-new-feature
   ```
4. **Open a Pull Request**:
   - Go to the original repository.
   - Click "New Pull Request".
   - Select your branch and submit the PR with a clear description.
5. **Release**:
   Once your PR is merged, repository maintainers should create a tag with the new version and run `Release` workflow to publish the new version to npm, create a GitHub release and update the documentation.
## Issues and Feature Requests
- Use the **GitHub Issues** tab to report bugs and request features.

## License
By contributing, you agree that your code will be licensed under the [MIT License](https://github.com/ukorvl/lightweight-charts-react-components/blob/main/lib/LICENSE).

Thank you for your contributions! 🎉
