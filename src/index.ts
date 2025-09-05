import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';
import type { FetchContext } from 'ofetch';
import { createFetch } from 'ofetch';

import { version as VERSION } from '../package.json';

export enum PlatformType {
  Figma = 'figma',
  MasterGo = 'mastergo',
  JSDesign = 'jsdesign',
  PixsoChina = 'pixso-china',
}

export enum ImportMode {
  Quick = 'quick',
  Interactive = 'interactive',
}

export interface IGeneratePluginDataOptions {
  width?: number;
  height?: number;
  importMode?: ImportMode;
  platform: PlatformType;
  attrs?: Record<string, string>;
}

export interface ICopyPasteInPluginOptions extends IGeneratePluginDataOptions {
  content: string | string[];
}

// export interface ICopyPasteDirectOptionsOptions {
//   width: number;
//   height: number;
//   platform: PlatformType.MasterGo;
// }

export interface CopyToDesignOptions {
  key: string;
  /** For internal development use only */
  _endpoint?: (platform: PlatformType) => string;
}

const $fetch = createFetch({
  defaults: {
    async onResponse(context: FetchContext) {
      if (context.error) {
        return;
      }

      const data = context.response?._data as any;

      if (!data || typeof data !== 'object') {
        return;
      }

      if (data.error) {
        context.error = data.error;
      } else if ('data' in data && context.response?._data) {
        context.response._data = data.data;
      }
    },
  },
});

const DEFAULT_GET_ENDPOINT = (platform: PlatformType) =>
  platform === PlatformType.Figma ? 'https://api.demoway.com' : 'https://api.demoway.cn';

export class CopyToDesign {
  constructor(private options: CopyToDesignOptions) {}

  private getEndpointByPlatform(platform: PlatformType) {
    const getEndPoint = this.options?._endpoint ?? DEFAULT_GET_ENDPOINT;
    return getEndPoint(platform);
  }

  get headers() {
    const url = window.location.href;

    return {
      Authorization: `Basic ${btoa(JSON.stringify({ url, key: this.options.key }))}`,
    };
  }

  private async generatePluginReceiveData(html: string | string[], options: IGeneratePluginDataOptions) {
    const { platform, importMode = ImportMode.Interactive, width, height, attrs = {} } = options;

    const endpoint = this.getEndpointByPlatform(platform);

    const source = JSON.stringify({ type: 'html', html, importMode, width, height });
    const secret = nanoid(32);
    const encrypted = CryptoJS.AES.encrypt(source, secret);

    const res = await $fetch<{ copyId: string }>('/api/refore/copy-to-design/save-copy-info', {
      baseURL: endpoint,
      method: 'POST',
      headers: this.headers,
      body: {
        secret,
      },
    });

    const div = document.createElement('refore-copy-to-design');
    div.setAttribute('data-copy-id', res.copyId);
    div.setAttribute('data-copy-sdk-version', VERSION);
    div.setAttribute('data-copy-endpoint', endpoint);
    div.setAttribute('data-copy-content', encrypted.toString());

    for (const key of Object.keys(attrs)) {
      div.setAttribute(key, attrs[key]);
    }

    return div.outerHTML;
  }

  /**
   * @deprecated
   * use `copyPasteInPlugin` instead
   */
  async copyToClipboardFromHTML(html: string | string[], options: IGeneratePluginDataOptions) {
    return this.copyPasteInPlugin({
      content: html,
      ...options,
    });
  }

  async copyPasteInPlugin(options: ICopyPasteInPluginOptions) {
    const { content, ...restOptions } = options;
    const data = await this.generatePluginReceiveData(content, restOptions);

    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([data], { type: 'text/html' }),
    });

    await navigator.clipboard.write([clipboardItem]);
  }

  // async copyPasteDirect(html: string | string[], options: ICopyPasteDirectOptionsOptions) {
  //   const { platform } = options;

  //   const data = await this.generatePluginReceiveData(html, {
  //     importMode: ImportMode.Quick,
  //     ...options,
  //     attrs: {
  //       'data-rpa': 'true',
  //     },
  //   });

  //   const endpoint = this.getEndpointByPlatform(platform);
  //   const res = await $fetch<{ content: string }>('/api/refore/copy-to-design/generate-paste-to-platform-data', {
  //     baseURL: endpoint,
  //     method: 'POST',
  //     headers: this.headers,
  //     body: {
  //       platform,
  //       data,
  //     },
  //   });

  //   const clipboardItem = new ClipboardItem({
  //     'text/html': new Blob([res.content], { type: 'text/html' }),
  //   });

  //   await navigator.clipboard.write([clipboardItem]);
  // }
}
