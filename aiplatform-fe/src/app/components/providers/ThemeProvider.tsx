'use client';

import { ReactNode } from 'react';
import { ConfigProvider, theme, App } from 'antd';
import { useThemeStore } from '../../store/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode } = useThemeStore();

  const antdTheme = {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#7F7FD5',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      borderRadius: 8,
      colorBgContainer: mode === 'dark' ? '#141414' : '#ffffff',
      colorText: mode === 'dark' ? '#ffffff' : '#000000',
      colorTextSecondary: mode === 'dark' ? '#8c8c8c' : '#666666',
      colorBgLayout: mode === 'dark' ? '#000000' : '#f5f5f5',
      colorBorder: mode === 'dark' ? '#303030' : '#d9d9d9',
    },
    components: {
      Layout: {
        headerBg: mode === 'dark' ? '#141414' : '#ffffff',
        bodyBg: mode === 'dark' ? '#000000' : '#f5f5f5',
        triggerBg: mode === 'dark' ? '#001529' : '#ffffff',
        siderBg: mode === 'dark' ? '#001529' : '#ffffff',
      },
      Menu: {
        colorBgContainer: mode === 'dark' ? '#001529' : '#ffffff',
        colorText: mode === 'dark' ? '#ffffff' : '#000000',
        itemBg: 'transparent',
        itemSelectedBg: mode === 'dark' ? '#1890ff' : '#e6f7ff',
        itemSelectedColor: mode === 'dark' ? '#ffffff' : '#1890ff',
      },
      Card: {
        colorBgContainer: mode === 'dark' ? '#1f1f1f' : '#ffffff',
        colorBorderSecondary: mode === 'dark' ? '#303030' : '#f0f0f0',
      },
      Button: {
        colorBgContainer: mode === 'dark' ? '#1f1f1f' : '#ffffff',
      },
      Input: {
        colorBgContainer: mode === 'dark' ? '#1f1f1f' : '#ffffff',
        colorBorder: mode === 'dark' ? '#434343' : '#d9d9d9',
      },
      Dropdown: {
        colorBgElevated: mode === 'dark' ? '#1f1f1f' : '#ffffff',
      },
    },
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}