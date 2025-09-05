# @refore-ai/copy-to-design-sdk

Import HTML pages into design tools like Figma via simple copy and paste.

## Install

```bash
pnpm add @refore-ai/copy-to-design-sdk
```

## Use

```typescript
import { CopyToDesign, PlatformType, ImportMode } from '@refore-ai/copy-to-design-sdk';

const copyToDesign = new CopyToDesign({
  key: '<YOUR_KEY>',
});

const firstPageHTML = `<!DOCTYPE html>
<html lang="en">
  <body>
    Here is my content for first page
  </body>
</html>
`;

const secondePageHTML = `<!DOCTYPE html>
<html lang="en">
  <body>
    Here is my content for second page
  </body>
</html>
`;

await copyToDesign.copyPasteInPlugin({
  content: [firstPageHTML, secondePageHTML],
  platform: PlatformType.Figma,
});

alert(
  'Copy successful. To paste these pages into Figma as editable designs, open the "Copy to Figma" plugin ( https://www.figma.com/community/plugin/1530991148057606658 ) and press Ctrl+V.',
);
```

## API Reference

### copyPasteInPlugin(options)

Copies HTML content to clipboard in a format that can be pasted into design tools.

#### Options

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `content` | `string \| string[]` | Yes | - | HTML content to be copied. Can be a single HTML string or an array of HTML strings for multiple pages. |
| `platform` | `PlatformType` | Yes | - | Target design platform. One of: `PlatformType.Figma`, `PlatformType.MasterGo`, `PlatformType.JSDesign`, `PlatformType.PixsoChina` |
| `width` | `number` | No | - | Width of the design in pixels. |
| `height` | `number` | No | - | Height of the design in pixels. |
| `importMode` | `ImportMode` | No | `ImportMode.Interactive` | Import mode. One of: `ImportMode.Interactive` (user can adjust import settings), `ImportMode.Quick` (direct import) |

#### Example

```typescript
await copyToDesign.copyPasteInPlugin({
  content: htmlString,
  platform: PlatformType.Figma,
  width: 1920,
  height: 1080,
  importMode: ImportMode.Quick,
});
```

## How to run example

Run vue example locally:

1. copy ./example/vue/.env.sample to ./example/vue/.env
2. replace <YOUR_KEY_HERE> in ./example/vue/.env
3. run command:

```bash
pnpm i
pnpm vue-example:install # install dependencies for vue example in example/vue
pnpm vue-example:dev # run vue example
```
