# @refore/copy-to-design-sdk

Import HTML pages into design tools like Figma via copy and paste.

![](./assets/example-screenshot.png)

## Support Platform

- Figma
- MasterGo
- Pixso
- JsDesign

## Run Demo

Run vue example locally:

1. copy ./example/vue/.env.sample to ./example/vue/.env
2. replace <YOUR_KEY_HERE> in ./example/vue/.env
3. run command:

```bash
pnpm vue-example:install
pnpm vue-example:dev
```

## Install SDK

```bash
npm install @refore/copy-to-design-sdk
yarn add @refore/copy-to-design-sdk
pnpm install @refore/copy-to-design-sdk
```

## Use SDK

```typescript
import { CopyToDesign, PlatformType } from '@refore/copy-to-design-sdk';

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
  platform: PlatformType.Figma,
});

alert('Copy successful. You can now paste it into the plugin.');
```
