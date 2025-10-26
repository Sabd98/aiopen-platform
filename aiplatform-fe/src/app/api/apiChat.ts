import api from '../utils/api';
import { processBuffer } from '../utils/processBuffer';
import type { OnChunk } from '../types/api';

export async function sendNonStream(prompt: string, conversationId?: string) {
  const res = await api.post('/chat', { prompt, conversationId, stream: false });
  return res.data; 
}

export async function sendStream(prompt: string, conversationId: string | undefined, onChunk: OnChunk) {
  const controller = new AbortController();
  // Build stream URL safely: if NEXT_PUBLIC_API_URL is set, use it and append /chat
  const streamBase = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
    : '/api';
  const streamUrl = `${streamBase}/chat`;

  const res = await fetch(streamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, conversationId, stream: true }),
    signal: controller.signal,
    credentials: 'include', 
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    throw new Error(`Stream failed: ${res.status} ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      processBuffer(buffer,onChunk);
    }
    processBuffer(buffer,onChunk);
  } finally {
    reader.releaseLock();
  }
}

export async function fetchHistory() {
  const res = await api.get('/chat');
  return res.data;
}
