import  { useState } from 'react';
import { Input, Button, Space, Switch } from 'antd';
import { useConversationStore } from '../../store/conversationStore';

type Props = {
  onSend: (text: string, stream: boolean) => void;
  disabled?: boolean;
  streamEnabled: boolean;
  onToggleStream: (v: boolean) => void;
};

export default function Composer({ onSend, disabled, streamEnabled, onToggleStream }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const isNewConversation = useConversationStore((s) => s.selectedConversationId === null);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text.trim(), streamEnabled);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <article className={`p-4 border-t ${isNewConversation ? 'max-w-none' : ''}`}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          autoSize={{ minRows: 2, maxRows: 6 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis pesan..."
        />
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Switch checked={streamEnabled} onChange={onToggleStream} />
            <span className="text-sm text-gray-600">Streaming</span>
          </div>
          <Button type="default" onClick={send} loading={sending} disabled={disabled}>
            Send
          </Button>
        </nav>
      </Space>
    </article>
  );
}
