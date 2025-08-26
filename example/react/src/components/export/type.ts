import { PlatformType } from '@refore-ai/copy-to-design-sdk';

/**
 * Configuration object for DESIGN_APPS
 * Defines supported design platforms and related information
 * Includes platform ID, title, icon, demo video, and plugin page
 */
export const DESIGN_APPS = {
  // Figma platform configuration
  [PlatformType.Figma]: {
    id: PlatformType.Figma,                              // Platform ID
    title: 'Figma',                                      // Display title
    icon: '/logo/third-party/figma.svg',                 // Platform icon path
    video: 'https://s.dwimg.top/refore/copy-to-design/copy-to-figma-v1.mp4', // Demo video URL
    plugin: 'https://www.figma.com/community/plugin/1530991148057606658',    // Plugin page URL
  },
  // MasterGo platform configuration
  [PlatformType.MasterGo]: {
    id: PlatformType.MasterGo,
    title: 'MasterGo',
    icon: '/logo/third-party/master-go.svg',
    video: 'https://s.dwimg.top/copy-to-design/mastergo.webm',
    plugin: 'https://mastergo.com/community/plugin/143082991349749',
  },
  // JSDesign platform configuration
  [PlatformType.JSDesign]: {
    id: PlatformType.JSDesign,
    title: 'JSDesign',
    icon: '/logo/third-party/js-design.svg',
    video: 'https://s.dwimg.top/copy-to-design/jsdesign.webm',
    plugin: 'https://js.design/community?category=detail&type=plugin&id=6878becbbad414f81929a6e7',
  },
  // PixsoChina platform configuration
  [PlatformType.PixsoChina]: {
    id: PlatformType.PixsoChina,
    title: 'Pixso',
    icon: '/logo/third-party/pixso.svg',
    video: 'https://s.dwimg.top/copy-to-design/pixso-china.webm',
    plugin: 'https://pixso.cn/plugins/?id=0bu9-hXiuohWPJhaxj7Tqw',
  },
} as const;

/**
 * Interface for ExportContent
 * Defines the structure of the content to be exported
 */
export interface ExportContent {
  html: string;    // HTML content string
  width?: number;  // Content width (optional)
  height?: number; // Content height (optional)
}

/**
 * Interface for ButtonOption
 * Defines the structure of platform button options
 */
export interface ButtonOption {
  id: string;      // Platform ID
  title: string;   // Button display title
  icon: string;    // Icon path
}