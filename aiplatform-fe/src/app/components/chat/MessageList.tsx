import { useEffect, useRef, useState, useCallback } from 'react';
import { List, Card } from 'antd';
import type { Message } from '../../types/api';
import { useChatStore } from '../../store/chatStore';
import { useConversationStore } from '../../store/conversationStore';
import { extractAnswerText } from '../../utils/extractAnswer';
import { RoleBadge } from './BadgeRole';

export default function MessageList({ messages }: { messages: Message[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isNewConversation = useConversationStore((s) => s.selectedConversationId === null);
  const loading = useConversationStore((s) => s.loading);

  const SCROLL_THRESHOLD = 150;

  const checkIsAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setIsAtBottom(true);
      return;
    }
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distance <= SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        const el = containerRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' as ScrollBehavior });
      }
    }
  }, [messages?.length, isAtBottom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => checkIsAtBottom();
    el.addEventListener('scroll', onScroll, { passive: true });
    checkIsAtBottom();
    return () => el.removeEventListener('scroll', onScroll);
  }, [checkIsAtBottom]);
  
  // Handle initialization after loading completes
  useEffect(() => {
    if (!loading && !isInitialized) {
      setIsInitialized(true);
      // Ensure scroll to bottom after initialization
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      }, 100);
    }
  }, [loading, isInitialized]);

  // Reset initialization when conversation changes
  const selectedConversationId = useConversationStore((s) => s.selectedConversationId);
  useEffect(() => {
    setIsInitialized(false);
  }, [selectedConversationId]);

  const renderContent = (m: Message) => {
    const c: any = m.content;
    if (c == null) return null;
    if (typeof c === 'string') {
      const s = c.trim();
      return s ? <div className="whitespace-pre-wrap break-words">{s}</div> : null;
    }

    const primary = extractAnswerText(c);
    if (primary) return <div className="whitespace-pre-wrap break-words">{primary}</div>;

    // fallback: show pretty JSON if no answer text found
    return <pre className="text-sm">{JSON.stringify(c, null, 2)}</pre>;
  };

  return (
    <article 
      ref={containerRef} 
      className="p-4 overflow-y-auto relative message-list"
      style={{ 
        height: '100%',
        maxHeight: '100%',
        overflowX: 'hidden'
      }}
    >
      <List
        dataSource={messages}
        renderItem={(m) => {
          // Debug: check if new conversation logic is working
          console.log('isNewConversation:', isNewConversation, 'selectedConversationId:', useConversationStore.getState().selectedConversationId);
          
          const sectionClass = isNewConversation
            ? 'w-full max-w-none !max-w-none'
            : (m.role === 'user'
                ? 'ml-auto w-full sm:w-[420px] md:w-[320px] max-w-[70%] min-w-[180px]'
                : 'mr-auto w-full sm:w-[420px] md:w-[1120px] max-w-[70%] min-w-[180px]');

          return (
            <List.Item key={m.id} className="!items-start">
              <section className={sectionClass} style={isNewConversation ? { width: '100%', maxWidth: 'none' } : {}}>
                <Card size="small" type="inner" className={m.role === 'user' ? 'bg-slate-100' : 'bg-slate-200'} style={{ padding: '2px 6px' }}>
                  <div className="whitespace-pre-wrap break-words">
                    {m.role === 'assistant' && isStreaming && (m.content == null || (typeof m.content === 'string' && m.content.trim() === '')) && (
                      <div className="typing-dots" aria-hidden>
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                    )}
                    {renderContent(m)}
                  </div>
                </Card>
                <div className="text-xs text-gray-400 mt-1">
                  <RoleBadge role={m.role} />
                </div>
              </section>
            </List.Item>
          );
        }}
      />
      <div ref={bottomRef} />
    </article>
  );

}
