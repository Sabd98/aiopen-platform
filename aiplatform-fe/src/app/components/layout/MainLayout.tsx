import { useEffect, useCallback } from "react";
import { Layout, message } from "antd";

import { useThemeStore } from "../../store/themeStore";
import { useConversationStore } from "../../store/conversationStore";
import { fetchConversations } from "../../api/apiConversation";
import Chat from "../chat/Chat";
import Sidebar from "./Sidebar";
import MyHeader from "./Header";

const { Content } = Layout;

export default function MainLayout() {
  const { setConversations, setLoading, setError } = useConversationStore();

  // Load conversations on mount
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConversations();
      setConversations(data.conversations || []);
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
      setError(err.message || "Failed to load conversations");
      message.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [setConversations, setLoading, setError]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const { mode } = useThemeStore();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <Layout>
        {/* Header */}
        <MyHeader />
        {/* Content Area */}
        <Content
          style={{
            margin: 0,
            padding: 0,
            background: mode === "dark" ? "#000000" : "#f5f5f5",
            overflow: "hidden",
            height: "calc(100vh - 64px)", 
          }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Chat />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
