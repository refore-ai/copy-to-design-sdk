import { Region } from '@refore-ai/copy-to-design-sdk';

const ACCESS_TOKEN = import.meta.env.VITE_COPY_TO_DESIGN_ACCESS_TOKEN;
const APP_ID = import.meta.env.VITE_COPY_TO_DESIGN_APP_ID;
const API_SERVER = import.meta.env.VITE_COPY_TO_DESIGN_SERVER
  ? () => import.meta.env.VITE_COPY_TO_DESIGN_SERVER
  : undefined;

export async function createCopyToDesign() {
  const { CopyToDesign } = await import('@refore-ai/copy-to-design-sdk');

  const copyToDesign = new CopyToDesign({
    region: Region.China,
    getAuthorizationPayload: async () => {
      return {
        accessToken: ACCESS_TOKEN,
        appId: APP_ID,
      };
    },
    _server: API_SERVER,
  });

  return copyToDesign;
}
