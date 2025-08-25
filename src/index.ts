// Encryption utility for data encryption and decryption
import CryptoJS from 'crypto-js';
// Utility for generating unique IDs
import { nanoid } from 'nanoid';
// Type definitions for HTTP request context
import type { FetchContext } from 'ofetch';
// Utility for creating HTTP requests
import { createFetch } from 'ofetch';

// Enumeration of supported platform types
// Figma: Figma design platform
// MasterGo: MasterGo design platform
// JSDesign: JSDesign design platform
// PixsoChina: Pixso China design platform
export enum PlatformType {
  Figma = 'figma',
  MasterGo = 'mastergo',
  JSDesign = 'jsdesign',
  PixsoChina = 'pixso-china',
}

// Interface for options to copy HTML to clipboard
// width: Width of the design element
// height: Height of the design element
// platform: Target design platform
export interface ICopyToClipboardFromHTMLOptions {
  width: number;
  height: number;
  platform: PlatformType;
}

// Interface for options to copy to design tools
// key: Authentication key
// _endpoint: Custom endpoint function for internal development
export interface CopyToDesignOptions {
  key: string;
  /** For internal development use only */
  _endpoint?: (platform: PlatformType) => string;
}

// Create a custom HTTP request instance
// Default configuration defines response handling logic
// If the response contains an error message, throw an error
// If the response contains a data field, extract it as the response content
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

// Default API endpoint retrieval function
// Return the corresponding API address based on platform type
// Figma platform uses the international API, others use the China API
const DEFAULT_GET_ENDPOINT = (platform: PlatformType) =>
  platform === PlatformType.Figma ? 'https://api.demoway.com' : 'https://api.demoway.cn';

// Core class for copying to design tools
// Provides functionality to copy HTML to clipboard
export class CopyToDesign {
  constructor(private options: CopyToDesignOptions) {}

  // Get API endpoint based on platform type
  private getEndpointByPlatform(platform: PlatformType) {
    const getEndPoint = this.options?._endpoint ?? DEFAULT_GET_ENDPOINT;
    return getEndPoint(platform);
  }

  // Get request headers
  get headers() {
    const url = window.location.href;

    return {
      Authorization: `Basic ${btoa(JSON.stringify({ url, key: this.options.key }))}`,
    };
  }

  // Copy HTML to clipboard
  async copyToClipboardFromHTML(html: string | string[], options: ICopyToClipboardFromHTMLOptions) {
    const { height, width, platform } = options;

    const endpoint = this.getEndpointByPlatform(platform);

    // Serialize data and encrypt
    const source = JSON.stringify({ type: 'html', html, height, width });
    const secret = nanoid(32);
    const encrypted = CryptoJS.AES.encrypt(source, secret);

    // Send request to save copy information
    const res = await $fetch<{ copyId: string }>('/api/refore/copy-to-design/save-copy-info', {
      baseURL: endpoint,
      method: 'POST',
      headers: this.headers,
      body: {
        secret,
      },
    });

    // Create custom element and set attributes
    const div = document.createElement('refore-copy-to-design');
    div.setAttribute('data-copy-id', res.copyId);
    div.setAttribute('data-copy-endpoint', endpoint);
    div.setAttribute('data-copy-content', encrypted.toString());

    // Create clipboard data and write to clipboard
    const data = new ClipboardItem({
      'text/html': new Blob([div.outerHTML], { type: 'text/html' }),
    });

    await navigator.clipboard.write([data]);
  }
}
