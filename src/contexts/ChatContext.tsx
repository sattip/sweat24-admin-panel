import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { chatApi } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';

interface ChatContextType {
  totalUnreadCount: number;
  setTotalUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
  openChatWithUser: (userId: number, userName: string) => void;
  selectedUserId: number | null;
  selectedUserName: string | null;
  clearSelectedUser: () => void;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const conversations = await chatApi.getConversations('active');
      // More defensive counting - only count if admin_unread_count is a valid positive number
      const unreadCount = conversations?.reduce((sum: number, conv: any) => {
        const count = conv.admin_unread_count;
        // Only add if it's a valid positive number
        if (typeof count === 'number' && count > 0 && !isNaN(count)) {
          return sum + count;
        }
        return sum;
      }, 0) || 0;
      
      console.log('Unread count calculation:', { conversations, unreadCount });
      setTotalUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // On error, set to 0 to avoid showing incorrect badge
      setTotalUnreadCount(0);
    }
  };

  const openChatWithUser = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    // Trigger chat widget to open (will be handled by the widget itself)
  };

  const clearSelectedUser = () => {
    setSelectedUserId(null);
    setSelectedUserName(null);
  };

  const connectWebSocket = () => {
    if (!user) return;

    try {
      // Get WebSocket URL from environment or API base URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws/chat`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        // Send authentication if needed
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ 
            type: 'auth', 
            token: localStorage.getItem('token') 
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'unread_count_update':
              setTotalUnreadCount(data.count || 0);
              break;
            case 'new_message':
              // Fetch updated unread count when new message arrives
              fetchUnreadCount();
              break;
            case 'conversation_update':
              // Refresh conversations if needed
              fetchUnreadCount();
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
        // Implement exponential backoff for reconnection
        if (user && reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          console.log(`Attempting to reconnect in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          // Fall back to polling if WebSocket fails repeatedly
          console.log('WebSocket reconnection failed, falling back to polling');
          startPollingFallback();
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      // Fall back to polling if WebSocket is not supported
      startPollingFallback();
    }
  };

  const startPollingFallback = () => {
    // Only use polling as a fallback when WebSocket fails
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds instead of 10
    return () => clearInterval(interval);
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchUnreadCount();
      
      // Try to establish WebSocket connection
      connectWebSocket();
      
      return () => {
        disconnectWebSocket();
      };
    }
  }, [user]);

  // Handle page visibility changes to manage connection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Disconnect when page is hidden to save resources
        disconnectWebSocket();
      } else if (user && !wsRef.current) {
        // Reconnect when page becomes visible
        connectWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return (
    <ChatContext.Provider value={{ 
      totalUnreadCount, 
      setTotalUnreadCount, 
      fetchUnreadCount,
      openChatWithUser,
      selectedUserId,
      selectedUserName,
      clearSelectedUser,
      isConnected
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}