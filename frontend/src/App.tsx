import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { ModelsPage } from './pages/ModelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { api } from './services/api';
import { TrafficWebSocketClient } from './services/websocket';
import { User, Incident, IncidentSummary, MLMetrics, LiveFlowPacket } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cybershield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cybershield_token'));
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // SOC States
  const [summary, setSummary] = useState<IncidentSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<MLMetrics | null>(null);
  const [livePacketsCount, setLivePacketsCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isStreamRunning, setIsStreamRunning] = useState<boolean>(false);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [currentDataset, setCurrentDataset] = useState<string>('CIC-IDS2017');

  // Chart States
  const [trafficHistory, setTrafficHistory] = useState<Array<{ time: string; pps: number; isAttack: boolean }>>([]);
  const [attackDistribution, setAttackDistribution] = useState<Record<string, number>>({});

  const wsClientRef = useRef<TrafficWebSocketClient | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const [sumData, incData, metData] = await Promise.all([
        api.getIncidentSummary(),
        api.getIncidents(undefined, undefined, 50),
        api.getMetrics(currentDataset),
      ]);
      setSummary(sumData);
      setIncidents(incData);
      setMetrics(metData);

      // Initial attack distribution
      const dist: Record<string, number> = {};
      incData.forEach((i) => {
        dist[i.attack_type] = (dist[i.attack_type] || 0) + 1;
      });
      setAttackDistribution(dist);
    } catch (e) {
      console.error('Error loading initial SOC data:', e);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, currentDataset]);

  // Setup WebSocket for Live Streaming
  useEffect(() => {
    if (!token) return;

    const handlePacket = (packet: LiveFlowPacket) => {
      setLivePacketsCount((prev) => prev + 1);

      // Update Live Traffic Dynamics chart
      const timeStr = new Date(packet.timestamp).toLocaleTimeString([], { hour12: false });
      setTrafficHistory((prev) => {
        const next = [...prev, { time: timeStr, pps: Math.round(packet.flow_bytes / 50), isAttack: packet.is_attack }];
        return next.slice(-25); // keep last 25 ticks
      });

      // If attack detected, add to incidents list and update distribution
      if (packet.is_attack && packet.incident) {
        setAttackDistribution((prev) => ({
          ...prev,
          [packet.attack_type]: (prev[packet.attack_type] || 0) + 1,
        }));

        setIncidents((prev) => {
          const newInc: Incident = {
            id: packet.incident!.id,
            timestamp: packet.timestamp,
            source_ip: packet.source_ip,
            dest_ip: packet.dest_ip,
            dest_port: packet.dest_port,
            protocol: 'TCP',
            attack_type: packet.attack_type,
            severity: packet.severity,
            confidence: packet.confidence,
            status: 'NEW',
          };
          return [newInc, ...prev.slice(0, 49)];
        });

        setSummary((prev) => (prev ? { ...prev, total_incidents: prev.total_incidents + 1, new: prev.new + 1 } : null));
      }
    };

    const handleStatus = (status: boolean) => {
      setIsConnected(status);
    };

    const client = new TrafficWebSocketClient(
      'ws://127.0.0.1:8000/api/v1/stream/ws/traffic',
      handlePacket,
      handleStatus
    );
    client.connect();
    wsClientRef.current = client;

    return () => {
      client.disconnect();
    };
  }, [token]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('cybershield_user', JSON.stringify(loggedInUser));
    setToken(localStorage.getItem('cybershield_token'));
  };

  const handleLogout = () => {
    localStorage.removeItem('cybershield_token');
    localStorage.removeItem('cybershield_user');
    setUser(null);
    setToken(null);
  };

  const handleToggleStream = async () => {
    const action = isStreamRunning ? 'pause' : 'start';
    try {
      const res = await api.controlStream(action, streamSpeed, currentDataset);
      setIsStreamRunning(res.is_running);
    } catch (e) {
      console.error('Error toggling stream:', e);
    }
  };

  const handleChangeSpeed = async (speed: number) => {
    setStreamSpeed(speed);
    if (isStreamRunning) {
      await api.controlStream('start', speed, currentDataset);
    }
  };

  const handleChangeDataset = async (ds: string) => {
    setCurrentDataset(ds);
    if (isStreamRunning) {
      await api.controlStream('start', streamSpeed, ds);
    }
    const met = await api.getMetrics(ds);
    setMetrics(met);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const updated = await api.updateIncidentStatus(id, newStatus, user?.username || 'Analyst');
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      const sum = await api.getIncidentSummary();
      setSummary(sum);
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleTrainModel = async (dsType: string) => {
    const res = await api.trainModel(dsType, 40);
    if (res.metrics) {
      setMetrics(res.metrics);
    }
  };

  if (!token || !user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200">
      <Navbar user={user} isConnected={isConnected} onLogout={handleLogout} />

      <div className="flex">
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          unreadIncidentsCount={summary?.new || 0}
        />

        <main className="flex-1 p-6 max-w-7xl mx-auto overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              livePacketsCount={livePacketsCount}
              trafficHistory={trafficHistory}
              attackDistribution={attackDistribution}
              recentIncidents={incidents.slice(0, 8)}
              isStreamRunning={isStreamRunning}
              streamSpeed={streamSpeed}
              currentDataset={currentDataset}
              onToggleStream={handleToggleStream}
              onChangeSpeed={handleChangeSpeed}
              onChangeDataset={handleChangeDataset}
              onStatusChange={handleStatusChange}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentsPage incidents={incidents} onStatusChange={handleStatusChange} />
          )}

          {currentTab === 'datasets' && <DatasetsPage />}

          {currentTab === 'models' && (
            <ModelsPage metrics={metrics} onTrainModel={handleTrainModel} currentDataset={currentDataset} />
          )}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
