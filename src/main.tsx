import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppProvider, useApp } from './store';
import LoginPage from './pages/Login';
import Shell from './pages/Shell';
import 'antd/dist/reset.css';
import './index.css';

function Root() {
  const { route } = useApp();
  return route === 'login' ? <LoginPage /> : <Shell />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#2456a6', borderRadius: 6, fontSize: 13 } }}>
      <AntdApp>
        <AppProvider><Root /></AppProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
);
