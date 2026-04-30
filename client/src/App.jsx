import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from './components/SidebarLayout';
import { OnlineMonitor } from './pages/OnlineMonitor';
import { WindowComparator } from './pages/WindowComparator';
import { LOBOverview } from './pages/LOBOverview';
import { SnapshotInspector } from './pages/SnapshotInspector';
import { LOBLiveStream } from './pages/LOBLiveStream';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SidebarLayout />}>
        <Route index element={<OnlineMonitor />} />
        <Route path="window" element={<WindowComparator />} />
        <Route path="lob" element={<LOBOverview />} />
        <Route path="lob/inspect" element={<SnapshotInspector />} />
        <Route path="lob/live" element={<LOBLiveStream />} />
      </Route>
    </Routes>
  );
}

export default App;
