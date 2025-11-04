import { Thumbmark } from '@thumbmarkjs/thumbmarkjs';
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';
import type { FetchContext } from 'ofetch';
import { createFetch } from 'ofetch';
import { withResolvers } from 'radashi';
import type { Socket } from 'socket.io-client';

import { version as VERSION } from '../package.json';
import { getPermission } from './permission';
import type { ISocketAuthPayload } from './socket-manager';
import { SocketManager } from './socket-manager';

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

export interface IPreparePasteInPluginOptions extends IGeneratePluginDataOptions {
  content: string | string[];
}

export interface ICopyCommonOption {
  /**
   * copy operation need user focus on the document, triggered when document is not focused
   */
  onWaitingForFocus?: () => any;
  /**
   * triggered when browser can't write clipboard in async function like safari, you should show another user action button to trigger clipboard write
   * @param writeToClipboard - The function to perform actual clipboard write operation
   */
  onUserActionRequired?: (writeToClipboard: () => void) => void;
}

export interface ICopyPasteInPluginOptions extends IPreparePasteInPluginOptions, ICopyCommonOption {}

export interface IPreparePasteDirectOptions {
  content: string | string[];
  width: number;
  height: number;
  platform: PlatformType.MasterGo;
  attrs?: Record<string, string>;
}

export interface ICopyPasteDirectOptions extends IPreparePasteDirectOptions, ICopyCommonOption {}

export interface CopyToDesignOptions {
  key: string;
  /** For internal development use only */
  _endpoint?: (platform: PlatformType) => string;
}

const COPY_TO_DESIGN_SDK_RESOURCE_TYPE = 'CopyToDesignSDK';

interface ICopyToDesignSDKResourceEventPayload {
  success: boolean;
  content: string;
}

const DEFAULT_GET_ENDPOINT = (platform: PlatformType) =>
  platform === PlatformType.Figma ? 'https://api.demoway.com' : 'https://api.demoway.cn';

export class CopyToDesign {
  private thumbmark = new Thumbmark();
  private visitorId: string | null = null;
  private socketManager = new SocketManager();

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

  private async getVisitorId() {
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

  async writeToClipboard(clipboardItem: ClipboardItem, options: ICopyCommonOption = {}) {
    const { onWaitingForFocus, onUserActionRequired } = options;

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

    const permission = await getPermission('clipboard-write');

    if (permission === 'denied') {
      throw new Error('clipboard-write permission is denied');
    }

    const writeClipboardDefer = withResolvers<void>();
    const writeClipboard = async () => {
      try {
        await navigator.clipboard.write([clipboardItem]);
        writeClipboardDefer.resolve();
      } catch (err) {
        writeClipboardDefer.reject(err);
      }
    };

    if (permission !== 'not-support') {
      await writeClipboard();
    } else {
      onUserActionRequired?.(writeClipboard);
    }

    await writeClipboardDefer.promise;
  }

  async preparePasteInPlugin(options: IPreparePasteInPluginOptions) {
    const { content, ...restOptions } = options;
    const data = await this.generatePluginReceiveDataForHTML(content, restOptions);

    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([data], { type: 'text/html' }),
    });

    return clipboardItem;
  }

  async copyPasteInPlugin(options: ICopyPasteInPluginOptions) {
    const clipboardItem = await this.preparePasteInPlugin(options);
    await this.writeToClipboard(clipboardItem, options);
  }

  /**
   * @deprecated
   * use `copyPasteInPlugin` instead
   */
  async copyToClipboardFromHTML(html: string | string[], options: Omit<ICopyPasteInPluginOptions, 'content'>) {
    return this.copyPasteInPlugin({
      content: html,
      ...options,
    });
  }

  async preparePasteDirect(options: IPreparePasteDirectOptions) {
    const { platform, content, width, height, attrs } = options;

    const endpoint = this.getEndpointByPlatform(platform);

    const authPayload: ISocketAuthPayload = {
      type: 'refore-key',
      ...this.getAuthorizationPayload(),
    };

    let connection: Socket | null = null;
    let taskId: string | null = null;

    try {
      connection = await this.socketManager.getOrCreateConnection(endpoint, authPayload);

      const pluginReceiveData = await this.generatePluginReceiveDataForHTML(content, {
        importMode: ImportMode.Quick,
        width,
        height,
        platform,
        attrs: {
          'data-rpa': 'true',
          ...attrs,
        },
      });

      ({ taskId } = await this.$fetch<{ taskId: string }>('/api/refore/copy-to-design/generate-paste-direct-data', {
        baseURL: endpoint,
        method: 'POST',
        body: {
          platform,
          content: pluginReceiveData,
        },
      }));

      // Subscribe to resource updates and wait for response
      const res = await this.socketManager.subscribeToResource<ICopyToDesignSDKResourceEventPayload>(
        connection,
        COPY_TO_DESIGN_SDK_RESOURCE_TYPE,
        taskId,
      );

      // write clipboard after user focused

      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([res.content], { type: 'text/html' }),
      });

      return clipboardItem;
      // Unsubscribe from resource updates
    } finally {
      if (connection && taskId) {
        this.socketManager.unsubscribeFromResource(connection, COPY_TO_DESIGN_SDK_RESOURCE_TYPE, taskId);
      }

      if (connection) {
        // Release connection (but keep it alive for reuse)
        this.socketManager.releaseConnection(endpoint);
      }
    }
  }

  async copyPasteDirect(options: ICopyPasteDirectOptions) {
    const clipboardItem = await this.preparePasteDirect(options);
    await this.writeToClipboard(clipboardItem, options);
  }
}
