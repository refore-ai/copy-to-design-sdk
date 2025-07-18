export const DESIGN_APPS = {
  Figma: {
    id: 'figma',
    title: 'Figma',
    icon: '/logo/third-party/figma.svg',
    video: 'https://s.dwimg.top/copy-to-design/figma.webm',
    plugin: 'https://mastergo.com/community/plugin/143082991349749',
  },
  MasterGo: {
    id: 'mastergo',
    title: 'MasterGo',
    icon: '/logo/third-party/master-go.svg',
    video: 'https://s.dwimg.top/copy-to-design/mastergo.webm',
    plugin: 'https://mastergo.com/community/plugin/143082991349749',
  },
  JSDesign: {
    id: 'jsdesign',
    title: 'JSDesign',
    icon: '/logo/third-party/js-design.svg',
    video: 'https://s.dwimg.top/copy-to-design/jsdesign.webm',
    plugin: 'https://js.design/community?category=detail&type=plugin&id=6878becbbad414f81929a6e7',
  },
  Pixso: {
    id: 'pixso-china',
    title: 'Pixso',
    icon: '/logo/third-party/pixso.svg',
    video: 'https://s.dwimg.top/copy-to-design/pixso-china.webm',
    plugin: 'https://pixso.cn/plugins/?id=0bu9-hXiuohWPJhaxj7Tqw',
  },
} as const;

export type DesignAppKey = keyof typeof DESIGN_APPS;
export type DesignAppId = (typeof DESIGN_APPS)[DesignAppKey]['id'];

export interface ExportContent {
  html: string;
  width?: number;
  height?: number;
}
