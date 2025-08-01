import { PlatformType } from '@refore/copy-to-design-sdk';

export const DESIGN_APPS = {
  [PlatformType.Figma]: {
    id: PlatformType.Figma,
    title: 'Figma',
    icon: '/logo/third-party/figma.svg',
    video: 'https://s.dwimg.top/refore/copy-to-design/copy-to-figma-v1.mp4',
    plugin: 'https://www.figma.com/community/plugin/1530991148057606658',
  },
  [PlatformType.MasterGo]: {
    id: PlatformType.MasterGo,
    title: 'MasterGo',
    icon: '/logo/third-party/master-go.svg',
    video: 'https://s.dwimg.top/copy-to-design/mastergo.webm',
    plugin: 'https://mastergo.com/community/plugin/143082991349749',
  },
  [PlatformType.JSDesign]: {
    id: PlatformType.JSDesign,
    title: 'JSDesign',
    icon: '/logo/third-party/js-design.svg',
    video: 'https://s.dwimg.top/copy-to-design/jsdesign.webm',
    plugin: 'https://js.design/community?category=detail&type=plugin&id=6878becbbad414f81929a6e7',
  },
  [PlatformType.PixsoChina]: {
    id: PlatformType.PixsoChina,
    title: 'Pixso',
    icon: '/logo/third-party/pixso.svg',
    video: 'https://s.dwimg.top/copy-to-design/pixso-china.webm',
    plugin: 'https://pixso.cn/plugins/?id=0bu9-hXiuohWPJhaxj7Tqw',
  },
} as const;

export interface ExportContent {
  html: string;
  width?: number;
  height?: number;
}
