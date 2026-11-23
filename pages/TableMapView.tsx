import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';

export const TableMapView: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { orders } = useAppContext();

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'ORDERS_UPDATED',
          ordersCount: orders.length,
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
    }
  }, [orders]);

  // Forward all BroadcastChannel and window messages into the tables.html iframe
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = (event) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(event.data, '*');
          } catch (e) {}
        }
      };
    } catch (e) {}

    const handleWindowMsg = (e: MessageEvent) => {
      if (e.data && e.data.type && iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(e.data, '*');
        } catch (err) {}
      }
    };
    window.addEventListener('message', handleWindowMsg);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('message', handleWindowMsg);
    };
  }, []);

  return (
    <div
      id="tables-iframe-container"
      className="w-full h-[calc(100vh-76px)] rounded-3xl overflow-hidden border-3 border-[#3a1a0e] shadow-[4px_4px_0_#3a1a0e] bg-[#f6efe2]"
    >
      <iframe
        ref={iframeRef}
        src="/tables.html"
        title="Restaurant Table Reservation and Servant Portal"
        className="w-full h-full border-0 block"
      />
    </div>
  );
};

export default TableMapView;
