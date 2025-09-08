import { Thumbmark } from '@thumbmarkjs/thumbmarkjs';
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';
import type { FetchContext } from 'ofetch';
import { createFetch } from 'ofetch';
import { withResolvers } from 'radashi';
import { io } from 'socket.io-client';

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

interface IGeneratePluginDataOptions {
  width?: number;
  height?: number;
  importMode?: ImportMode;
  platform: PlatformType;
  attrs?: Record<string, string>;
}

export interface ICopyPasteInPluginOptions extends Omit<IGeneratePluginDataOptions, 'attrs'> {
  content: string | string[];
}

export interface ICopyPasteDirectOptionsOptions {
  content: string | string[];
  width: number;
  height: number;
  platform: PlatformType.MasterGo;
  onWaitingForFocus?: () => void;
}

export interface CopyToDesignOptions {
  key: string;
  /** For internal development use only */
  _endpoint?: (platform: PlatformType) => string;
}

const SOCKET_RESOURCE_TYPE = 'CopyToDesignSDK';

interface IResourceSubscribeEvent<T> {
  resourceType: string;
  resourceId: string;
  payload?: T;
}

interface ICopyToDesignSDKPayload {
  success: boolean;
  content: string;
}

const DEFAULT_GET_ENDPOINT = (platform: PlatformType) =>
  platform === PlatformType.Figma ? 'https://api.demoway.com' : 'https://api.demoway.cn';

export class CopyToDesign {
  private thumbmark = new Thumbmark();
  private visitorId: string | null = null;

  private $fetch = createFetch({
    defaults: {
      onRequest: async (context) => {
        const headers = context.options.headers;
        const visitorId = await this.getVisitorId();

        context.options.query = {
          ...context.options.query,
          visitorId,
          version: VERSION,
        };

        headers.set('Authorization', `Basic ${btoa(JSON.stringify(this.getAuthorizationPayload()))}`);
      },
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

  constructor(private options: CopyToDesignOptions) {
    if (!this.options.key) {
      throw new Error('options.key is Required');
    }
  }

  private getAuthorizationPayload() {
    const url = window.location.href;

    return { url, key: this.options.key };
  }

  private getEndpointByPlatform(platform: PlatformType) {
    const getEndPoint = this.options?._endpoint ?? DEFAULT_GET_ENDPOINT;
    return getEndPoint(platform);
  }

  async getVisitorId() {
    if (!this.visitorId) {
      const tm = await this.thumbmark.get();
      this.visitorId = tm.thumbmark;
    }

    return this.visitorId;
  }

  private async generatePluginReceiveDataForHTML(html: string | string[], options: IGeneratePluginDataOptions) {
    const { platform, importMode = ImportMode.Interactive, width, height, attrs = {} } = options;

    const endpoint = this.getEndpointByPlatform(platform);

    const source = JSON.stringify({ type: 'html', html, importMode, width, height });
    const secret = nanoid(32);
    const encrypted = CryptoJS.AES.encrypt(source, secret);

    const res = await this.$fetch<{ copyId: string }>('/api/refore/copy-to-design/save-copy-info', {
      baseURL: endpoint,
      method: 'POST',
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
    const data = await this.generatePluginReceiveDataForHTML(content, restOptions);

    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([data], { type: 'text/html' }),
    });

    await navigator.clipboard.write([clipboardItem]);
  }

  async copyPasteDirect(options: ICopyPasteDirectOptionsOptions) {
    const { platform, content, width, height, onWaitingForFocus } = options;

    const endpoint = this.getEndpointByPlatform(platform);
    const connection = io(endpoint, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: (cb) => {
        cb({
          type: 'refore-key',
          ...this.getAuthorizationPayload(),
        });
      },
    });

    const pluginReceiveData = await this.generatePluginReceiveDataForHTML(content, {
      importMode: ImportMode.Quick,
      width,
      height,
      platform,
      attrs: {
        'data-rpa': 'true',
        // for debug
        'data-copy-endpoint': 'https://api.demoway.cn',
      },
    });

    const { taskId } = await this.$fetch<{ taskId: string }>('/api/refore/copy-to-design/generate-paste-direct-data', {
      baseURL: endpoint,
      method: 'POST',
      body: {
        platform,
        content: pluginReceiveData,
      },
    });

    connection.emit('resource:subscribe', {
      resourceType: SOCKET_RESOURCE_TYPE,
      resourceId: taskId,
    });

    const defer = withResolvers<ICopyToDesignSDKPayload>();

    connection.on('resource:subscribe', (event: IResourceSubscribeEvent<ICopyToDesignSDKPayload>) => {
      if (!event.payload) {
        return;
      }

      if (event.payload.success) {
        defer.resolve(event.payload);
      } else {
        defer.reject();
      }
    });

    try {
      const res = await defer.promise;

      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([res.content], { type: 'text/html' }),
      });

      // check document is focused
      if (!document.hasFocus()) {
        onWaitingForFocus?.();

        const focusDefer = withResolvers<void>();
        const handleFocus = () => {
          window.removeEventListener('focus', handleFocus);
          focusDefer.resolve();
        };
        window.addEventListener('focus', handleFocus);
        await focusDefer.promise;
      }

      // write clipboard after user focused
      await navigator.clipboard.write([clipboardItem]);
    } finally {
      connection.emit('resource:unsubscribe', {
        resourceType: SOCKET_RESOURCE_TYPE,
        resourceId: taskId,
      });

      connection.disconnect();
    }
  }
}
