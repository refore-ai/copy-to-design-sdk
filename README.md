# @refore/copy-to-design-sdk

Copy the HTML source and import it into the design platform via the plugin.

## Support Platform

- Figma
- MasterGo
- Pixso
- 即时设计

## Install

```bash
npm install @refore/copy-to-design-sdk
yarn add @refore/copy-to-design-sdk
pnpm install @refore/copy-to-design-sdk
```

## Usage

```typescript
import { CopyToDesign } from '@refore/copy-to-design-sdk';

const copyToDesign = new CopyToDesign({
  key: '<YOUR_KEY>',
});

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo</title>

    <style>
      .box {
        color: #fe3460;
      }
    </style>
  </head>
  <body>
    <div class="box">Here is my content</div>
  </body>
</html>
`;

await copyToDesign.copyToClipboardFromHTML(html, {
  width: 1920,
  height: 1080,
});

alert('Copy successful. You can now paste it into the plugin.');
```
