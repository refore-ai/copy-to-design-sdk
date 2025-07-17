import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';
import type { FetchContext } from 'ofetch';
import { createFetch } from 'ofetch';

export enum PlatformType {
  Figma = 'figma',
  MasterGo = 'mastergo',
  JSDesign = 'jsdesign',
  PixsoChina = 'pixso-china',
}

export interface ICopyToClipboardFromHTMLOptions {
  width: number;
  height: number;
  platform: PlatformType;
}

interface DevOptions {
  endpoint: (platform: PlatformType) => string;
}

export interface CopyToDesignOptions {
  key: string;
  dev?: DevOptions;
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
    const getEndPoint = this.options.dev?.endpoint ?? DEFAULT_GET_ENDPOINT;
    return getEndPoint(platform);
  }

  get headers() {
    const url = window.location.href;

    return {
      Authorization: `Basic ${btoa(JSON.stringify({ url, key: this.options.key }))}`,
    };
  }

  async copyToClipboardFromHTML(html: string, options: ICopyToClipboardFromHTMLOptions) {
    const { height, width, platform } = options;

    const endpoint = this.getEndpointByPlatform(platform);

    const source = JSON.stringify({ type: 'html', html, height, width, endpoint });
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
    div.setAttribute('data-copy-content', encrypted.toString());

    const data = new ClipboardItem({
      'text/html': new Blob([div.outerHTML], { type: 'text/html' }),
    });

    await navigator.clipboard.write([data]);
  }
}
