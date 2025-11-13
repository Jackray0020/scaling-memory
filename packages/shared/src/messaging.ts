import { Message, MessageType } from './types';

export function createMessage<T = any>(
  type: MessageType,
  payload?: T
): Message<T> {
  return {
    type,
    payload,
    timestamp: Date.now(),
  };
}

export async function sendMessageToBackground<T = any>(
  message: Message
): Promise<T> {
  return chrome.runtime.sendMessage(message);
}

export async function sendMessageToTab<T = any>(
  tabId: number,
  message: Message
): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message);
}

export function onMessage(
  callback: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => void | boolean | Promise<any>
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const result = callback(message, sender, sendResponse);
    if (result instanceof Promise) {
      result.then(sendResponse);
      return true;
    }
    return result;
  });
}
