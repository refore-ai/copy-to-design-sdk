import { Thumbmark } from '@thumbmarkjs/thumbmarkjs';
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';
import type { FetchContext } from 'ofetch';
import { createFetch } from 'ofetch';
import { withResolvers } from 'radashi';
import type { Socket } from 'socket.io-client';
import type { Promisable } from 'type-fest';

import { version as VERSION } from '../package.json';
import type { PlatformType } from './enum';
import { ImportMode, Region } from './enum';
import { getPermission } from './permission';
import { SocketManager } from './socket-manager';

export interface IAuthorizationPayload {
  accessToken: string;
  appId: string;
}

export * from './enum';

export interface IGeneratePluginDataOptions {
  content: string | string[];
  width?: number;
  height?: number;
  importMode?: ImportMode;
  platform: PlatformType;
  attrs?: Record<string, string>;
  copyInfo?: Record<string, any>;
  topLayerName?: {
    referrer?: false | string;
  };
}

export interface IPreparePasteInPluginOptions extends IGeneratePluginDataOptions {}

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

export interface IPreparePasteDirectOptions extends Omit<IPreparePasteInPluginOptions, 'platform' | 'importMode'> {
  platform: PlatformType.MasterGo;
}

export interface ICopyPasteDirectOptions extends IPreparePasteDirectOptions, ICopyCommonOption {}

export interface CopyToDesignOptions {
  region: Region;
  getAuthorizationPayload: () => Promisable<IAuthorizationPayload>;
  /** For internal development use only */
  _server?: (region: Region) => string;
}

const COPY_TO_DESIGN_SDK_RESOURCE_TYPE = 'CopyToDesignSDK';

interface ICopyToDesignSDKResourceEventPayload {
  success: boolean;
  content: string;
}

const DEFAULT_GET_SERVER = (region: Region) =>
  region === Region.World ? 'https://api.demoway.com' : 'https://api.demoway.cn';

export class CopyToDesign {
  private thumbmark = new Thumbmark();
  private visitorId: string | null = null;
  private socketManager = new SocketManager();

  private $fetch = createFetch({
    defaults: {
      onRequest: async (context) => {
        const headers = context.options.headers;
        const visitorId = await this.getVisitorId();
        const payload = await this.getAuthorizationPayload();

        context.options.query = {
          ...context.options.query,
          client: 'copy-to-design-sdk',
          version: VERSION,
          visitorId,
          appId: payload.appId,
        };

        headers.set('Authorization', `Bearer ${payload.accessToken}`);
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

  constructor(private options: CopyToDesignOptions) {}

  private getAuthorizationPayload() {
    return this.options.getAuthorizationPayload();
  }

  private getServerByRegion(region: Region) {
    const getServer = this.options?._server ?? DEFAULT_GET_SERVER;
    return getServer(region);
  }

  private async getVisitorId() {
    if (!this.visitorId) {
      const tm = await this.thumbmark.get();
      this.visitorId = tm.thumbmark;
    }

    return this.visitorId;
  }

  private async generatePluginReceiveDataForHTML(options: IGeneratePluginDataOptions) {
    const {
      content,
      platform,
      importMode = ImportMode.Interactive,
      width,
      height,
      attrs = {},
      topLayerName,
      copyInfo,
    } = options;

    const server = this.getServerByRegion(this.options.region);

    const source = JSON.stringify({ type: 'html', html: content, importMode, width, height });
    const secret = nanoid(32);
    const encrypted = CryptoJS.AES.encrypt(source, secret);

    const res = await this.$fetch<{ copyId: string }>('/api/refore/copy-to-design-v2/save-copy-info', {
      baseURL: server,
      method: 'POST',
      body: {
        ...copyInfo,
        secret,
        platform,
      },
    });

    const div = document.createElement('refore-copy-to-design');
    div.setAttribute('data-copy-id', res.copyId);
    div.setAttribute('data-copy-sdk-version', VERSION);
    div.setAttribute('data-copy-server', server);
    div.setAttribute('data-copy-content', encrypted.toString());

    const resolvedTopLayerName = Object.assign({ referrer: location.origin }, topLayerName);
    div.setAttribute('data-copy-top-layer-name', JSON.stringify(resolvedTopLayerName));

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
    const data = await this.generatePluginReceiveDataForHTML(options);

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
    const { platform, ...rest } = options;

    const server = this.getServerByRegion(this.options.region);

    let connection: Socket | null = null;
    let taskId: string | null = null;

    try {
      const authorizationPayload = await this.getAuthorizationPayload();
      connection = await this.socketManager.getOrCreateConnection(server, {
        accessToken: authorizationPayload.accessToken,
      });

      const pluginReceiveData = await this.generatePluginReceiveDataForHTML({
        importMode: ImportMode.Quick,
        platform,
        ...rest,
        attrs: {
          ...rest.attrs,
          'data-rpa': 'true',
        },
      });

      ({ taskId } = await this.$fetch<{ taskId: string }>('/api/refore/copy-to-design-v2/generate-paste-direct-data', {
        baseURL: server,
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
        this.socketManager.releaseConnection(server);
      }
    }
  }

  async copyPasteDirect(options: ICopyPasteDirectOptions) {
    const clipboardItem = await this.preparePasteDirect(options);
    await this.writeToClipboard(clipboardItem, options);
  }
}
