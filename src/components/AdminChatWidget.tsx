import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Check, X, Archive, UserCircle, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { chatApi, usersApi } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: number;
  content: string;
  sender_type: 'user' | 'admin';
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  messages: Message[];
  status: 'active' | 'resolved' | 'archived';
  last_message_at: string;
  admin_unread_count: number;
  last_message?: Message;
}

export function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationUserId, setNewConversationUserId] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { setTotalUnreadCount, fetchUnreadCount, selectedUserId, selectedUserName, clearSelectedUser } = useChat();
  const { toast } = useToast();

  // Calculate total unread messages - only from active conversations
  const totalUnread = activeTab === 'active' 
    ? conversations.reduce((sum, conv) => {
        const count = conv.admin_unread_count;
        // Debug logging
        if (count > 0) {
          console.log(`Unread messages from ${conv.user.name}:`, count);
        }
        return sum + (count || 0);
      }, 0)
    : 0;

  // Update context when total unread changes
  useEffect(() => {
    console.log('Updating unread count:', { activeTab, totalUnread, conversations });
    setTotalUnreadCount(totalUnread);
  }, [totalUnread, setTotalUnreadCount]);

  // Fetch conversations when widget opens or tab changes
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, activeTab]);

  // Poll for new messages when widget is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);

  // Handle selected user from context (e.g., from Users page)
  useEffect(() => {
    if (selectedUserId && selectedUserName) {
      setIsOpen(true);
      setShowNewConversation(true);
      setNewConversationUserId(selectedUserId.toString());
      fetchAvailableUsers();
      clearSelectedUser(); // Clear after using
    }
  }, [selectedUserId, selectedUserName]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getConversations(activeTab);
      const convs = response || [];
      setConversations(convs);
      
      // Debug: Log any unread messages
      if (activeTab === 'active') {
        const unreadDetails = convs.filter((c: any) => c.admin_unread_count > 0);
        if (unreadDetails.length > 0) {
          console.log('Conversations with unread messages:', unreadDetails);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await usersApi.getAll();
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response?.data && Array.isArray(response.data)) {
        users = response.data;
      } else if (response?.users && Array.isArray(response.users)) {
        users = response.users;
      }
      
      // Filter active users who don't already have active conversations
      const activeUsers = users.filter((user: any) => 
        (user.status === 'active' || user.status === 'pending_approval')
      );
      
      setAvailableUsers(activeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const startNewConversation = async () => {
    if (!newConversationUserId || !newConversationMessage.trim()) return;

    try {
      setSending(true);
      
      // Try to create new conversation via API
      try {
        const response = await chatApi.startConversation(
          parseInt(newConversationUserId), 
          newConversationMessage.trim()
        );
        
        // Success - refresh and show the new conversation
        setShowNewConversation(false);
        setNewConversationUserId('');
        setNewConversationMessage('');
        await fetchConversations();
        
        // Select the new conversation if it was created
        if (response?.conversation) {
          setSelectedConversation(response.conversation);
        }
        
        toast({
          title: "Επιτυχία",
          description: "Η συνομιλία ξεκίνησε επιτυχώς.",
        });
        return;
      } catch (apiError: any) {
        // If API doesn't support it yet, try alternative approach
        if (apiError?.message?.includes('405') || apiError?.message?.includes('404')) {
          // Check if conversation already exists
          const existingConversations = await chatApi.getConversations('active');
          const existingConv = existingConversations?.find((conv: any) => 
            conv.user.id === parseInt(newConversationUserId)
          );

          if (existingConv) {
            // If conversation exists, select it and send message
            setSelectedConversation(existingConv);
            setShowNewConversation(false);
            setMessage(newConversationMessage);
            // Wait a bit for state to update
            setTimeout(() => {
              sendMessage();
            }, 100);
            toast({
              title: "Συνομιλία βρέθηκε",
              description: "Το μήνυμα θα σταλεί στην υπάρχουσα συνομιλία.",
            });
          } else {
            // API doesn't support creating new conversations yet
            toast({
              title: "Προσωρινά μη διαθέσιμο",
              description: "Η δημιουργία νέας συνομιλίας απαιτεί ενημέρωση του συστήματος. Παρακαλώ επικοινωνήστε με τον τεχνικό σας.",
              variant: "destructive",
            });
          }
        } else {
          throw apiError;
        }
      }
      
      // Reset form
      setNewConversationUserId('');
      setNewConversationMessage('');
      setShowNewConversation(false);
      
      // Refresh conversations
      await fetchConversations();
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η έναρξη συνομιλίας. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read
    if (conversation.admin_unread_count > 0) {
      try {
        await chatApi.markAsRead(conversation.id);
        // Update local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, admin_unread_count: 0 }
            : conv
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation || sending) return;

    const messageContent = message.trim();
    setMessage('');
    setSending(true);

    try {
      const response = await chatApi.sendMessage(selectedConversation.id, messageContent);

      // Update selected conversation with new message
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, response.message]
      });

      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageContent);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const updateConversationStatus = async (status: 'active' | 'resolved' | 'archived') => {
    if (!selectedConversation) return;

    try {
      await chatApi.updateStatus(selectedConversation.id, status);
      setSelectedConversation(null);
      fetchConversations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40",
          "bg-purple-600 hover:bg-purple-700",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500">
            {totalUnread}
          </Badge>
        )}
      </Button>

      {/* Chat Management Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[800px] h-[600px] bg-white rounded-lg shadow-2xl z-50",
          "flex transition-all duration-300 ease-in-out",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-purple-600 text-white rounded-tl-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Συνομιλίες Πελατών</h3>
              <div className="flex items-center gap-2">
                <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchAvailableUsers()}
                      className="text-white hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Νέα Συνομιλία
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Έναρξη Νέας Συνομιλίας</DialogTitle>
                      <DialogDescription>
                        Επιλέξτε έναν πελάτη και στείλτε το πρώτο μήνυμα για να ξεκινήσετε μια νέα συνομιλία.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Επιλογή Πελάτη</label>
                        <Select value={newConversationUserId} onValueChange={setNewConversationUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε πελάτη..." />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Αναζήτηση πελάτη..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                            {availableUsers
                              .filter(user => 
                                user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                              )
                              .map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={user.profilePicture} />
                                      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{user.name}</div>
                                      <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Μήνυμα</label>
                        <Textarea
                          placeholder="Γράψτε το μήνυμά σας..."
                          value={newConversationMessage}
                          onChange={(e) => setNewConversationMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNewConversation(false);
                          setNewConversationUserId('');
                          setNewConversationMessage('');
                        }}
                      >
                        Ακύρωση
                      </Button>
                      <Button
                        onClick={startNewConversation}
                        disabled={!newConversationUserId || !newConversationMessage.trim() || sending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Αποστολή
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-purple-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 p-1">
              <TabsTrigger value="active">
                Ενεργές
                {activeTab !== 'active' && conversations.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white h-5 px-1">
                    {conversations.reduce((sum, conv) => sum + (conv.admin_unread_count || 0), 0)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved">Επιλυμένες</TabsTrigger>
              <TabsTrigger value="archived">Αρχείο</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-[450px]">
                {loading && conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Φόρτωση...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Δεν υπάρχουν {activeTab === 'active' ? 'ενεργές' : activeTab === 'resolved' ? 'επιλυμένες' : 'αρχειοθετημένες'} συνομιλίες
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={cn(
                        "p-4 border-b cursor-pointer hover:bg-gray-50",
                        selectedConversation?.id === conv.id && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conv.user.avatar} />
                          <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conv.user.name}</h4>
                            {conv.admin_unread_count > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {conv.admin_unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conv.user.email}</p>
                          {conv.last_message && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conv.last_message.sender_type === 'user' ? 'Πελάτης: ' : 'Εσείς: '}
                              {conv.last_message.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(conv.last_message_at), 'dd/MM HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Conversation View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.user.avatar} />
                    <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedConversation.user.name}</h4>
                    <p className="text-sm text-gray-500">{selectedConversation.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedConversation.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateConversationStatus('resolved')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Επίλυση
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateConversationStatus('archived')}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Αρχείο
                      </Button>
                    </>
                  )}
                  {selectedConversation.status !== 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateConversationStatus('active')}
                    >
                      Επαναφορά
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.sender_type === 'admin' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender_type === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender.avatar} />
                          <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-4 py-2",
                          msg.sender_type === 'admin'
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            msg.sender_type === 'admin' ? "text-purple-100" : "text-gray-500"
                          )}
                        >
                          {format(new Date(msg.created_at), 'HH:mm', { locale: el })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Πληκτρολογήστε την απάντησή σας..."
                    disabled={sending || selectedConversation.status !== 'active'}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending || selectedConversation.status !== 'active'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <UserCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Επιλέξτε μια συνομιλία για να ξεκινήσετε</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}