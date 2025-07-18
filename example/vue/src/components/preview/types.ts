export enum PreviewSource {
  Assistant = 'assistant',
  User = 'user',
  UserHistory = 'user-history',
}

export interface Preview {
  id: string;
  lang: string;
  value: string;
  source: PreviewSource;
  messageId: string;
}
