# Prettier Java formatter

**Prettier Java formatter** is a lightweight Visual Studio Code extension that integrates [Prettier Java](https://github.com/jhipster/prettier-java) directly into your editor, enabling seamless and consistent Java code formatting.

This extension allows you to format your Java files using Prettier's Java plugin while maintaining full control over the version and configuration of Prettier, Prettier Java, and Node.

## ✨ Features

- Formats Java files using [Prettier Java](https://github.com/jhipster/prettier-java)
- Supports any version of Node, Prettier and Prettier Java via user-defined paths
- Lightweight and dependency-free — no bundled packages
- Fully compatible with VS Code's formatting workflow (including `Format document` command)
- Manual restart command available (`Prettier Java formatter: Restart`)

## 🖥️ Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
|macOS|✅ Supported|Fully tested and functional
|Linux|⚠️ Expected|Support expected but not confirmed yet|
|Windows|🚫 Not yet supported|Planned for future release|

## 📦 Installation
### 📍 From the Marketplace (Recommended)

The easiest way to install Prettier Java formatter is directly from the Visual Studio Code Marketplace:

- Open VS Code
- Go to the Extensions view (Ctrl+Shift+X)
- Search for "Prettier Java formatter"
- Click Install

Alternatively, you can install it via the [Marketplace web page](https://marketplace.visualstudio.com/) with one click.

### 🛠️ From Source (Manual Build)

If you prefer to build the extension yourself from source, follow these steps:

- Clone the repository:
```bash
git clone git@github.com:Robinsstudio/prettier-java-formatter.git
cd prettier-java-formatter
```

- Install dev dependencies:
```
npm ci
```

- Build the extension:

```bash
npm run build
```
- Install `vsce` if it isn't installed yet:

```bash
npm install -g @vscode/vsce
```
- Package the extension into a `.vsix` file using `vsce`:

```bash
vsce package
```
This will generate a `.vsix` file in the project directory.

- Locate the `.vsix` file in your file explorer within VS Code.

- Right-click it and select `Install Extension VSIX`, or use the command:

```bash
code --install-extension prettier-java-formatter.vsix
```
You're now ready to use the extension!

## 🔧 Requirements

This extension relies on three external dependencies that must be available either globally or via user-provided paths:

- **Node.js**
- **Prettier**
- **Prettier Java plugin**

## ⚙️ Configuration

You can provide paths to the required executables and modules via the following VS Code settings:

| Setting | Description |
|--------|-------------|
| `prettier-java-formatter.pathToNode` | Absolute path to Node home, which should end with \"/bin\". |
| `prettier-java-formatter.pathToPrettier` | Absolute path to Prettier in node_modules, which should end with \"/node_modules/prettier\". |
| `prettier-java-formatter.pathToPrettierJavaPlugin` | Absolute path to plugin Prettier Java in node_modules, which should end with \"/node_modules/prettier-plugin-java\". |

These settings are **optional**. If omitted, the extension will attempt to resolve them globally:

- **Node.js** is resolved from the system `PATH`
- **Prettier** and **Prettier Java plugin** are resolved from globally installed Node modules

You may mix and match local and global installations freely.

### Example `settings.json`:

```json
{
  "prettier-java-formatter.pathToNode": "/Users/Robinsstudio/.nvm/versions/node/v20.11.1/bin",
  "prettier-java-formatter.pathToPrettier": "/Users/Robinsstudio/.nvm/versions/node/v20.11.1/lib/node_modules/prettier",
  "prettier-java-formatter.pathToPrettierJavaPlugin": "/Users/Robinsstudio/.nvm/versions/node/v20.11.1/lib/node_modules/prettier-plugin-java"
}
```

## 🚀 Usage
### Automatic Formatting

To enable format-on-save using Prettier Java, add the following to your `settings.json` file:
```json
{
  "[java]": {
    "editor.defaultFormatter": "Robinsstudio.prettier-java-formatter",
    "editor.formatOnSave": true
  }
}
```

### Manual Formatting

You can also manually format a Java file using the built-in `Format Document` command:

- Command Palette → Format Document
- Right-click → Format Document

## 🔄 Restarting the Formatter

If you need to manually restart the formatting server, please run:

- Command Palette → `Prettier Java formatter: Restart`

Note: The formatter automatically restarts when any of the configuration properties (`pathToNode`, `pathToPrettier`, `pathToPrettierJavaPlugin`) are changed.

## 💡 Why external dependencies?

This extension does not bundle Prettier, Prettier Java, or Node. This gives you full control over the versions used, which is important because Prettier Java formatting output can change across versions.

## 🛠️ Troubleshooting
- Ensure all required tools are installed and paths are correctly configured
- Use the `Prettier Java Formatter: Restart` command if you suspect stale state
- Check the Output panel for error messages under the Prettier Java Formatter log
- If none of the above works out for you, feel free to open an issue

## 🙏 Acknowledgements

Special thanks to the developers and maintainers of the following open-source projects, without whom this extension wouldn’t be possible:

- [**Prettier**](https://prettier.io/) – An opinionated code formatter for many languages
- [**Prettier Java**](https://github.com/jhipster/prettier-java) – A plugin that brings Prettier’s formatting power to Java
- [**Node.js**](https://nodejs.org/) – A powerful JavaScript runtime that makes it all run smoothly behind the scenes
- [**TypeScript**](https://www.typescriptlang.org/) – The fabulous superset that makes JavaScript a language we love to work with
- [**Visual Studio Code**](https://code.visualstudio.com/) – The amazing editor that makes everything possible

---

Made with ❤️ by Robinsstudio
