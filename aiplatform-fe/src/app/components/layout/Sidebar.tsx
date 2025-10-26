import { deleteConversation, getConversation } from "@/app/api/apiConversation";
import { useChatStore } from "@/app/store/chatStore";
import { useConversationStore } from "@/app/store/conversationStore";
import { Layout, Menu, Button, Typography, Switch, message, Spin } from "antd";
import {
  MessageOutlined,
  PlusOutlined,
  SunOutlined,
  MoonOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/app/store/themeStore";
import { useCallback, useEffect, useRef } from "react";

const { Sider } = Layout;
const { Text } = Typography;

export default function Sidebar() {
  const { 
    conversations, 
    loading, 
    selectedConversationId,
    setSelectedConversation, 

    deleteConversation: removeConversation
  } = useConversationStore();
  const { clear: clearChat, setMessages,isCollapsed,setCollapsed } = useChatStore();
  const { mode, toggleTheme } = useThemeStore();

  const handleNewChat = () => {
    setSelectedConversation(null);
    clearChat();
  };

  const handleDeleteConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await deleteConversation(conversationId);
      removeConversation(conversationId);
      message.success("Conversation deleted");

      // If this was the selected conversation, clear the chat
      if (selectedConversationId === conversationId) {
        setSelectedConversation(null);
        clearChat();
      }
    } catch (err: any) {
      console.error("Failed to delete conversation:", err);
      message.error("Failed to delete conversation");
    }
  };
  
   const handleSelectConversation = useCallback(async (conversationId: string) => {
    try {
      setSelectedConversation(conversationId);
      
      // Fetch the complete conversation with all messages
      const fullConversation = await getConversation(conversationId);
      
      if (fullConversation && fullConversation.messages) {
        const messages = fullConversation.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        }));
        setMessages(messages, conversationId);
      } else {
        // If no messages, just set the conversation ID
        setMessages([], conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      message.error('Failed to load conversation');
    }
  }, [setSelectedConversation, setMessages]);

  // Auto-select most recent conversation when conversations are loaded
  // Only auto-select on initial load. If the user explicitly clears the selection
  // (e.g. clicks "New Chat") we should not re-select a conversation.
  const initialAutoSelectRef = useRef(true);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0 && !loading && initialAutoSelectRef.current) {
      const sortedConversations = conversations.slice().sort((a: any, b: any) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const mostRecent = sortedConversations[0];
      handleSelectConversation(mostRecent.id);
      initialAutoSelectRef.current = false;
    }
  }, [conversations, selectedConversationId, loading, handleSelectConversation]);
  

  const conversationMenuItems = conversations.map((conv) => ({
    key: conv.id,
    icon: <MessageOutlined />,
    label: (
      <div
        className="conversation-item"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Text ellipsis style={{ flex: 1, marginRight: "8px" }}>
          {conv.title}
        </Text>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={(e) => handleDeleteConversation(conv.id, e)}
          style={{
            opacity: 0.6,
            minWidth: "auto",
            padding: "4px",
          }}
        />
      </div>
    ),
  }));

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={isCollapsed}
      onBreakpoint={(broken) => setCollapsed(broken)}
      breakpoint="md"
      collapsedWidth={0}
      width={280}
      style={{
        background: mode === "dark" ? "#001529" : "#ffffff",
        borderRight: `1px solid ${mode === "dark" ? "#303030" : "#f0f0f0"}`,
      }}
    >
      <div style={{ padding: "16px" }}>
        {/* New Chat Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          size="large"
          style={{ marginBottom: "16px" }}
          onClick={handleNewChat}
        >
          {!isCollapsed && "New Chat"}
        </Button>

        {/* Conversations List */}
        <div style={{ marginBottom: "16px" }}>
          {!isCollapsed && (
            <Text
              type="secondary"
              style={{ fontSize: "12px", textTransform: "uppercase" }}
            >
              Conversations
            </Text>
          )}
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="small" />
            </div>
          ) : (
            <Menu
              mode="inline"
              selectedKeys={
                selectedConversationId ? [selectedConversationId] : []
              }
              style={{
                border: "none",
                background: "transparent",
                marginTop: isCollapsed ? 0 : "8px",
              }}
              items={conversationMenuItems}
              onClick={({ key }) => handleSelectConversation(key)}
            />
          )}
        </div>
      </div>

      {/* Bottom section with theme toggle */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          borderTop: `1px solid ${mode === "dark" ? "#303030" : "#f0f0f0"}`,
        }}
      >
        {/* Theme Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            marginBottom: "12px",
          }}
        >
          {!isCollapsed && (
            <span style={{ fontSize: "12px" }}>
              {mode === "dark" ? <MoonOutlined /> : <SunOutlined />} Theme
            </span>
          )}
          <Switch
            checked={mode === "dark"}
            onChange={toggleTheme}
            size="small"
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>
      </div>
    </Sider>
  );
}
