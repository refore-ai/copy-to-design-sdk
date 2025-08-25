# Installation
```bash
pnpm add @refore-ai/copy-to-design-sdk
```

# Usage
Use the SDK in your project:

```typescript
import { CopyToDesign, PlatformType } from '@refore-ai/copy-to-design-sdk';

const copyToDesign = new CopyToDesign({
  key: '<YOUR_KEY>',
});

const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    Here is my content
  </body>
</html>
`;

await copyToDesign.copyToClipboardFromHTML([html], {
  width: 1920,
  height: 1080,
  platform: PlatformType.Figma,
});

alert('Copy successful. You can now paste it into the plugin.');
```

# Running Example Projects

This project includes two example applications built with Vue and React, demonstrating how to use the SDK in real-world scenarios.

## Vue Example
To run the Vue example locally:
1. Copy the environment variable configuration file:

```bash
cp ./example/vue/.env.sample ./example/vue/.env
```

2. Edit `./example/vue/.env` and replace `<YOUR_KEY_HERE>` with your actual API key.

3. Install dependencies and run the example:
```bash
pnpm install
pnpm vue-example:dev
```
4. Access the example in your browser at `http://localhost:port`.

## React Example
To run the React example locally:
1. Configure the environment variables:

```bash
cp ./example/react/.env.example ./example/react/.env
```

2. Edit `./example/react/.env` and set the following field:
```env
VITE_COPY_TO_DESIGN_KEY=<YOUR_KEY_HERE>
```
Replace `<YOUR_KEY_HERE>` with your actual API key.

3. Install dependencies and run the example:
```bash
pnpm install
pnpm react-example:dev
```
4. Access the example in your browser at `http://localhost:port`.

# Obtaining an API Key
To use this SDK, you need to obtain an API key:

1. Visit the Refore official website.
2. Register an account or log in to an existing one.
3. Create a new application or select an existing one.
4. Generate a new API key in the application settings or API management page.
5. Copy the generated key to the environment variable configuration of the example applications.

# Supported Design Platforms
The SDK currently supports the following design platforms:
- Figma - International Figma platform
- MasterGo - MasterGo design platform
- JSDesign - JSDesign design platform
- Pixso China - Pixso China edition

# Example Application Features
Both example applications (Vue and React) provide the same functionality:

1. **Content Preview** - Load and display example HTML content (Google homepage).
2. **Code Editing** - Edit the example HTML content and toggle between preview and source code modes.
3. **Export Functionality** - Provides "Copy to Figma" and "Copy to MasterGo" buttons.
4. **Export Process** - Automatically executes the export process when a button is clicked and displays status feedback.
5. **Video Demonstration** - Shows a demo video of platform usage.
6. **Plugin Navigation** - Provides a link to jump to the corresponding design tool plugin after successful export.