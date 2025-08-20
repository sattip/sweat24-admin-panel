import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const { user } = useAuth();

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

  // Fetch unread count on mount and poll every 10 seconds
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <ChatContext.Provider value={{ 
      totalUnreadCount, 
      setTotalUnreadCount, 
      fetchUnreadCount,
      openChatWithUser,
      selectedUserId,
      selectedUserName,
      clearSelectedUser
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