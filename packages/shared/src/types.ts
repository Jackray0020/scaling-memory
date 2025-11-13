export enum MessageType {
  CAPTURE_PAGE_CONTENT = 'CAPTURE_PAGE_CONTENT',
  CONTENT_CAPTURED = 'CONTENT_CAPTURED',
  GET_PAGE_INFO = 'GET_PAGE_INFO',
  PAGE_INFO_RESPONSE = 'PAGE_INFO_RESPONSE',
}

export interface Message<T = any> {
  type: MessageType;
  payload?: T;
  timestamp: number;
}

export interface PageContent {
  url: string;
  title: string;
  textContent: string;
  html?: string;
  metadata?: {
    description?: string;
    keywords?: string[];
    author?: string;
  };
}

export interface PageInfo {
  url: string;
  title: string;
  favicon?: string;
  timestamp: number;
}
