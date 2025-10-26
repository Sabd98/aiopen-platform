
import MessageList from "./MessageList";
import Composer from "./Composer";
import { useChatStore } from "../../store/chatStore";
import { useConversationStore } from "../../store/conversationStore";
import { v4 as uuidv4 } from "uuid";
import { sendNonStream, sendStream } from "../../api/apiChat";
import { useEffect } from "react";

export default function Chat() {
  const {
    messages,
    addMessage,
    updateMessageContent,
    conversationId,
    setConversationId,
    setStreaming,
    isStreaming,
    isLoading,
    setLoading,
  } = useChatStore();
  
  const { 
    selectedConversationId, 
    updateConversation, 
    addConversation 
  } = useConversationStore();

  // onSend handles both modes
  const onSend = async (text: string, stream: boolean) => {
    setLoading(true);
    const currentConvId = selectedConversationId || conversationId;
    
    if (!stream) {
      addMessage({ id: uuidv4(), role: 'user', content: text });
      try {
        const res = await sendNonStream(text, currentConvId);
        if (res.conversationId) {
          setConversationId(res.conversationId);
          
          // If this is a new conversation, add it to the store
          if (!currentConvId) {
            const newConv = {
              id: res.conversationId,
              title: text.length > 50 ? text.substring(0, 47) + '...' : text,
              userId: '', // Will be set by backend
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            addConversation(newConv);
          } else {
            // Update existing conversation's updatedAt
            updateConversation(res.conversationId, {
              updatedAt: new Date().toISOString()
            });
          }
        }
        addMessage({ id: uuidv4(), role: 'assistant', content: res.reply ?? '' });
      } catch (err: any) {
        addMessage({ id: uuidv4(), role: 'assistant', content: `Error: ${err.message || err}` });
      } finally {
        setLoading(false);
      }
      return;
    }

    // streaming path
    const userId = uuidv4();
    addMessage({ id: userId, role: 'user', content: text });

    const assistantId = uuidv4();
    addMessage({ id: assistantId, role: 'assistant', content: '' });
    setStreaming(true);

    try {
      await sendStream(text, currentConvId, (chunk) => {
        // try parse JSON, otherwise treat as text chunk
        let parsed: any = null;
        try { parsed = JSON.parse(chunk); } catch { /* not JSON */ }

        const store = useChatStore.getState();
        const m = store.messages.find((x) => x.id === assistantId);
        if (!m) return;

        if (parsed && typeof parsed === 'object') {
          if (m.content && typeof m.content === 'object') updateMessageContent(assistantId, { ...m.content, ...parsed });
          else updateMessageContent(assistantId, parsed);
        } else {
          // append text chunk
          if (m.content == null) updateMessageContent(assistantId, chunk);
          else if (typeof m.content === 'string') updateMessageContent(assistantId, m.content + chunk);
          else if (typeof m.content === 'object') updateMessageContent(assistantId, { ...m.content, text: (m.content.text || '') + chunk });
          else updateMessageContent(assistantId, chunk);
        }
      });
      
      // Handle conversation creation/update for streaming as well
      const finalConvId = useChatStore.getState().conversationId;
      if (finalConvId && !currentConvId) {
        const newConv = {
          id: finalConvId,
          title: text.length > 50 ? text.substring(0, 47) + '...' : text,
          userId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addConversation(newConv);
      } else if (finalConvId) {
        updateConversation(finalConvId, {
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      updateMessageContent(assistantId, `Error: ${err.message || err}`);
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  };

  const onToggleStream = (v: boolean) => {
    useChatStore.getState().setStreaming(v);
  };

  // Load conversation when selectedConversationId changes
  useEffect(() => {
    // If there's no selected conversation, clear the chat
    if (!selectedConversationId) {
      useChatStore.getState().clear();
    }
  }, [selectedConversationId]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '24px',
      margin: '0 auto',
      width: '100%',
      maxHeight: '100vh',
      overflow: 'hidden'
    }}>
      <div style={{ 
        flex: 1, 
        overflow: 'hidden', 
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <MessageList messages={messages} />
      </div>
      <div style={{ flexShrink: 0, paddingTop: '16px' }}>
        <Composer
          onSend={onSend}
          disabled={isLoading}
          streamEnabled={isStreaming}
          onToggleStream={onToggleStream}
        />
      </div>
    </div>
  );
}
