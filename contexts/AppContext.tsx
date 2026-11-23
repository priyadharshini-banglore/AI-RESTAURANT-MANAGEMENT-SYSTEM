import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Table, TableStatus, Order, OrderItem, OrderStatus, WasteLog, Feedback, VisualWasteLog, MenuItem, LeftoverWasteReport } from '../types';
import { TABLES, MOCK_WASTE_LOGS, MOCK_FEEDBACK, MENU_ITEMS } from '../constants';

export interface DashboardConfig {
  targetRevenue: number;
  targetWasteReduction: number;
  estLossRupees: number;
}

interface AppContextType {
  tables: Table[];
  orders: Order[];
  wasteLogs: WasteLog[];
  feedback: Feedback[];
  visualWasteLogs: VisualWasteLog[];
  wasteReports: LeftoverWasteReport[];
  menuItems: MenuItem[];
  dashboardConfig: DashboardConfig;
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  updateTableStatus: (tableId: number, status: TableStatus) => void;
  addOrder: (tableId: number, items: OrderItem[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addWasteLog: (log: Omit<WasteLog, 'id'>) => void;
  addFeedback: (feedback: Omit<Feedback, 'id'>) => void;
  addVisualWasteLog: (log: Omit<VisualWasteLog, 'id' | 'createdAt'>) => void;
  addWasteReport: (report: LeftoverWasteReport) => void;
  deleteWasteReport: (reportId: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: number) => void;
  updateDashboardConfig: (config: Partial<DashboardConfig>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_DASHBOARD_CONFIG: DashboardConfig = {
  targetRevenue: 50000,
  targetWasteReduction: 25,
  estLossRupees: 14500,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>(TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(MOCK_WASTE_LOGS);
  const [feedback, setFeedback] = useState<Feedback[]>(MOCK_FEEDBACK);
  const [visualWasteLogs, setVisualWasteLogs] = useState<VisualWasteLog[]>([]);
  const [wasteReports, setWasteReports] = useState<LeftoverWasteReport[]>([]);

  // Persistent Auth for Admin (Only requires login 1st time!)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('restroai_admin_auth_v1') === 'true';
  });

  // Dynamic Menu Items (Persisted via localStorage & Server Sync)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('restroai_menu_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MENU_ITEMS;
  });

  // Customizable Dashboard Metrics Config
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => {
    const saved = localStorage.getItem('restroai_dashboard_config_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DASHBOARD_CONFIG;
  });

  const loginAdmin = useCallback((password: string) => {
    // Check against standard access PINs
    if (password === 'admin123' || password === '1234' || password === '0000' || password === 'restro') {
      localStorage.setItem('restroai_admin_auth_v1', 'true');
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('restroai_admin_auth_v1');
    setIsAdminAuthenticated(false);
  }, []);

  // 1. Initialize server state and start real-time sync polling loop (every 1.2s) across all devices
  useEffect(() => {
    const initServer = async () => {
      try {
        await fetch('/api/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tables: TABLES, orders: [], menuItems: MENU_ITEMS, dashboardConfig: INITIAL_DASHBOARD_CONFIG }),
        });
      } catch (e) {}
    };
    initServer();

    const interval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            const parsedOrders = data.orders.map((o: any) => ({
              ...o,
              createdAt: typeof o.createdAt === 'string' ? new Date(o.createdAt) : o.createdAt,
            }));
            setOrders(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(parsedOrders)) return parsedOrders;
              return prev;
            });
          }
          if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
            setTables(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.tables)) return data.tables;
              return prev;
            });
          }
          if (data.menuItems && Array.isArray(data.menuItems) && data.menuItems.length > 0) {
            setMenuItems(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.menuItems)) {
                localStorage.setItem('restroai_menu_v1', JSON.stringify(data.menuItems));
                return data.menuItems;
              }
              return prev;
            });
          }
          if (data.wasteReports && Array.isArray(data.wasteReports)) {
            setWasteReports(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.wasteReports)) {
                return data.wasteReports;
              }
              return prev;
            });
          }
          if (data.dashboardConfig && data.dashboardConfig.targetRevenue) {
            setDashboardConfig(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.dashboardConfig)) {
                localStorage.setItem('restroai_dashboard_config_v1', JSON.stringify(data.dashboardConfig));
                return data.dashboardConfig;
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    }, 2500);

    const channel = new BroadcastChannel('restro_orders_sync');
    channel.onmessage = (event) => {
      if (event.data?.type === 'WASTE_REPORT_ADDED' && event.data.report) {
        setWasteReports(prev => {
          if (prev.some(r => r.id === event.data.report.id)) return prev;
          return [event.data.report, ...prev];
        });
      }
    };

    return () => {
      clearInterval(interval);
      try { channel.close(); } catch (e) {}
    };
  }, []);

  const updateTableStatus = useCallback((tableId: number, status: TableStatus) => {
    setTables(prevTables =>
      prevTables.map(table => (table.id === tableId ? { ...table, status } : table))
    );
    fetch('/api/tables/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, status }),
    }).catch(() => {});
  }, []);

  const addOrder = useCallback((tableId: number, items: OrderItem[]) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      tableId,
      items,
      status: OrderStatus.Preparing,
      createdAt: new Date(),
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    updateTableStatus(tableId, TableStatus.Occupied);

    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.postMessage({
        type: 'ORDER_PLACED',
        tableId,
        items,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) {}

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    }).catch(() => {});
  }, [updateTableStatus]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    let affectedTableId: number | undefined;

    setOrders(prevOrders => {
      const match = prevOrders.find(o => o.id === orderId);
      if (match) {
        affectedTableId = match.tableId;
      }
      return prevOrders.map(order => (order.id === orderId ? { ...order, status } : order));
    });

    if (affectedTableId !== undefined) {
      try {
        const saved = localStorage.getItem(`restroai_table_${affectedTableId}_kitchen_tracker`);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.status = status;
          if (status === OrderStatus.Preparing) parsed.step = 2;
          else if (status === OrderStatus.Ready) parsed.step = 4;
          else if (status === OrderStatus.Served) parsed.step = 5;
          localStorage.setItem(`restroai_table_${affectedTableId}_kitchen_tracker`, JSON.stringify(parsed));
        }
      } catch (e) {}

      try {
        const channel = new BroadcastChannel('restro_orders_sync');
        channel.postMessage({
          type: 'ORDER_STATUS_UPDATED',
          orderId,
          tableId: affectedTableId,
          status,
          timestamp: Date.now(),
        });
        channel.close();
      } catch (e) {}
    } else {
      try {
        const channel = new BroadcastChannel('restro_orders_sync');
        channel.postMessage({
          type: 'ORDER_STATUS_UPDATED',
          orderId,
          status,
          timestamp: Date.now(),
        });
        channel.close();
      } catch (e) {}
    }

    fetch('/api/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    }).catch(() => {});
  }, []);
  
  const addWasteLog = useCallback((log: Omit<WasteLog, 'id'>) => {
    const newLog: WasteLog = {
      id: `WL-${Date.now()}`,
      ...log
    };
    setWasteLogs(prev => [...prev, newLog]);
  }, []);

  const addFeedback = useCallback((fb: Omit<Feedback, 'id'>) => {
    const newFeedback: Feedback = {
      id: `FB-${Date.now()}`,
      ...fb
    };
    setFeedback(prev => [...prev, newFeedback]);
  }, []);

  const addVisualWasteLog = useCallback((log: Omit<VisualWasteLog, 'id' | 'createdAt'>) => {
    const newLog: VisualWasteLog = {
      id: `VWL-${Date.now()}`,
      createdAt: new Date(),
      ...log
    };
    setVisualWasteLogs(prev => [...prev, newLog]);
  }, []);

  const addWasteReport = useCallback((report: LeftoverWasteReport) => {
    setWasteReports(prev => [report, ...prev]);
    fetch('/api/waste-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report })
    }).catch(() => {});
  }, []);

  const deleteWasteReport = useCallback((reportId: string) => {
    setWasteReports(prev => prev.filter(r => r.id !== reportId));
    fetch(`/api/waste-reports?id=${encodeURIComponent(reportId)}`, {
      method: 'DELETE'
    }).catch(() => {});
  }, []);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    setMenuItems(prev => {
      const nextId = prev.length > 0 ? Math.max(...prev.map(m => m.id)) + 1 : 1;
      const nextMenu = [...prev, { id: nextId, ...item }];
      localStorage.setItem('restroai_menu_v1', JSON.stringify(nextMenu));
      fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItems: nextMenu }),
      }).catch(() => {});
      return nextMenu;
    });
  }, []);

  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(prev => {
      const nextMenu = prev.map(m => (m.id === item.id ? item : m));
      localStorage.setItem('restroai_menu_v1', JSON.stringify(nextMenu));
      fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItems: nextMenu }),
      }).catch(() => {});
      return nextMenu;
    });
  }, []);

  const deleteMenuItem = useCallback((id: number) => {
    setMenuItems(prev => {
      const nextMenu = prev.filter(m => m.id !== id);
      localStorage.setItem('restroai_menu_v1', JSON.stringify(nextMenu));
      fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItems: nextMenu }),
      }).catch(() => {});
      return nextMenu;
    });
  }, []);

  const updateDashboardConfig = useCallback((config: Partial<DashboardConfig>) => {
    setDashboardConfig(prev => {
      const nextConfig = { ...prev, ...config };
      localStorage.setItem('restroai_dashboard_config_v1', JSON.stringify(nextConfig));
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardConfig: nextConfig }),
      }).catch(() => {});
      return nextConfig;
    });
  }, []);

  const contextValue = useMemo<AppContextType>(() => ({
    tables,
    orders,
    wasteLogs,
    feedback,
    visualWasteLogs,
    wasteReports,
    menuItems,
    dashboardConfig,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    updateTableStatus,
    addOrder,
    updateOrderStatus,
    addWasteLog,
    addFeedback,
    addVisualWasteLog,
    addWasteReport,
    deleteWasteReport,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateDashboardConfig,
  }), [
    tables,
    orders,
    wasteLogs,
    feedback,
    visualWasteLogs,
    wasteReports,
    menuItems,
    dashboardConfig,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    updateTableStatus,
    addOrder,
    updateOrderStatus,
    addWasteLog,
    addFeedback,
    addVisualWasteLog,
    addWasteReport,
    deleteWasteReport,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateDashboardConfig,
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};