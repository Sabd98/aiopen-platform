import { useAuthStore } from "@/app/store/authStore";
import { Layout, Button, Avatar, Dropdown, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/app/store/themeStore";
import { useChatStore } from "@/app/store/chatStore";
const { Header } = Layout;
const { Text } = Typography;

export default function MyHeader() {
  const { user, logout } = useAuthStore();
  const { mode } = useThemeStore();
  const { isCollapsed, setCollapsed } = useChatStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: user?.username || "Profile",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },

  ];
  return (
    <Header
      style={{
        padding: "0 24px",
        background: mode === "dark" ? "#141414" : "#ffffff",
        borderBottom: `1px solid ${mode === "dark" ? "#303030" : "#f0f0f0"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!isCollapsed)}
          style={{ fontSize: "16px", width: 64, height: 64 }}
        />
        <Typography.Title level={4} style={{ margin: 0 }}>
          AI Chat Platform
        </Typography.Title>
      </div>

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          <Avatar icon={<UserOutlined />} style={{ marginRight: "8px" }} />
          <Text>{user?.username}</Text>
        </div>
      </Dropdown>
    </Header>
  );
}
