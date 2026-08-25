import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Workspace from './pages/Workspace';
import ChatPage from './pages/workspace/Chat';
import AnalyticsPage from './pages/workspace/Analytics';
import ModelsPage from './pages/workspace/Models';
import ApiKeysPage from './pages/workspace/ApiKeys';
import SettingsPage from './pages/workspace/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/workspace" element={<Workspace />}>
          <Route index element={<ChatPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="api-keys" element={<ApiKeysPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
