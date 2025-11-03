import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Calendar, Check, CheckCheck, Circle } from "lucide-react";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import api from "@/api/api"; // <-- axios instance

type User = {
  id: number;
  name: string; // display name (mapped from fullName or username)
  avatar?: string;
  username?: string;
  fullName?: string;
};

type Msg = {
  id?: string | number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read?: boolean;
  tempId?: string; // ID tạm thời để theo dõi tin nhắn chưa được server xác nhận
};

const Chat = () => {
  const myId = Number(localStorage.getItem("userId")) || 1;
  const token = localStorage.getItem("accessToken");

  // --- users từ API ---
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // --- Tin nhắn lưu theo cặp user (bắt đầu rỗng) ---
  const [conversations, setConversations] = useState<Record<string, Msg[]>>({});

  const [input, setInput] = useState("");
  const [typingUserId, setTypingUserId] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // --- Hàm tạo conversation key từ 2 user ID ---
  const getConversationKey = (user1Id: number, user2Id: number): string => {
    const sortedIds = [user1Id, user2Id].sort((a, b) => a - b);
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  // --- current conversation key & messages ---
  const currentConversationKey = selectedUser ? getConversationKey(myId, selectedUser.id) : "";
  const messages = useMemo(() => (currentConversationKey ? conversations[currentConversationKey] || [] : []), [conversations, currentConversationKey]);

  // ---------- STOMP hook integration ----------
  const onMessage = useCallback((incoming: any) => {
    console.log("📩 Processing incoming message:", incoming);

    let senderId: number, receiverId: number;

    if (incoming.sender && incoming.to) {
      senderId = parseInt(incoming.sender);
      receiverId = parseInt(incoming.to);
    } else {
      senderId = incoming.senderId;
      receiverId = incoming.receiverId;
    }

    const conversationKey = getConversationKey(senderId, receiverId);

    setConversations(prev => {
      const copy = { ...prev };
      const arr = copy[conversationKey] ? [...copy[conversationKey]] : [];

      const isDuplicate = arr.some(msg =>
        msg.id === incoming.id ||
        (msg.tempId && incoming.tempId && msg.tempId === incoming.tempId)
      );

      if (!isDuplicate) {
        arr.push({
          id: incoming.id ?? `server-${Date.now()}`,
          senderId: senderId,
          receiverId: receiverId,
          content: incoming.content,
          timestamp: incoming.timestamp || new Date().toISOString(),
          read: incoming.read ?? false,
        });
        copy[conversationKey] = arr;
      }

      return copy;
    });
  }, []);

  const onTyping = useCallback((payload: any) => {
    console.log("⌨️ Typing event received:", payload);
    if (!payload) return;
    const sender = payload.senderId ?? parseInt(payload.sender ?? -1);
    const receiver = payload.receiverId ?? parseInt(payload.receiver ?? -1);
    if (sender && receiver === myId) {
      setTypingUserId(sender);
      setTimeout(() => {
        setTypingUserId(curr => (curr === sender ? null : curr));
      }, 2000);
    }
  }, [myId]);

  const { sendMessage, sendTyping } = useChat(myId, token, onMessage, onTyping);

  // ---------- Fetch users từ API (axios) ----------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('api/users');
        // backend có thể trả body trực tiếp hoặc nằm trong res.data.data
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : [];

        const mapped: User[] = list.map((u: any) => ({
          id: u.id,
          name: u.fullName ?? u.username ?? u.name ?? `User ${u.id}`,
          avatar: u.avatar,
          username: u.username,
          fullName: u.fullName,
        }));

        const other = mapped.filter(u => u.id !== myId);
        setUsers(other);
        if (!selectedUser && other.length > 0) setSelectedUser(other[0]);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [token, myId]);

  // ---------- typing debounce ----------
  const typingTimer = useRef<number | undefined>(undefined);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (typingTimer.current) window.clearTimeout(typingTimer.current);

    if (e.target.value.trim() && selectedUser) {
      sendTyping({ receiverId: selectedUser.id, senderId: myId });
    }

    typingTimer.current = window.setTimeout(() => {
      typingTimer.current = undefined;
    }, 800);
  };

  // ---------- send handler ----------
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    if (!selectedUser) {
      toast.error('Vui lòng chọn người để gửi tin nhắn');
      return;
    }

    const tempId = `t-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const payload: Msg = {
      id: tempId,
      senderId: myId,
      receiverId: selectedUser.id,
      content: text,
      timestamp,
      read: false,
      tempId: tempId
    };

    // Optimistic update
    const conversationKey = getConversationKey(myId, selectedUser.id);
    setConversations(prev => {
      const copy = { ...prev };
      const arr = copy[conversationKey] ? [...copy[conversationKey]] : [];
      arr.push(payload);
      copy[conversationKey] = arr;
      return copy;
    });

    // Send via websocket
    sendMessage({ receiverId: selectedUser.id, content: text, tempId });

    setInput('');
  };

  useEffect(() => {
    setTypingUserId(null);
  }, [selectedUser?.id]);

  // ---------- Tạo danh sách conversations cho UI ----------
  const conversationList = useMemo(() => {
    return users.slice(0, 5).map((user) => {
      const convKey = getConversationKey(myId, user.id);
      const convMessages = conversations[convKey] || [];
      const lastMessage = convMessages.slice(-1)[0];

      return {
        user,
        lastMessage: lastMessage?.content ?? "Chưa có tin nhắn",
        timestamp: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        }) : "Mới",
        unread: convMessages.filter(msg => msg.senderId === user.id && !msg.read).length,
        online: false,
      };
    });
  }, [users, conversations, myId]);

  const handleSendDateProposal = () => {
    if (!selectedUser) {
      toast.error('Chọn người trước khi gửi đề xuất');
      return;
    }
    toast.success("Đã gửi đề xuất lịch hẹn!");
  };

  // 👇 DEBUG COMPONENT
  const DebugPanel = () => (
    <div className="fixed top-4 left-4 bg-background border rounded-lg p-3 shadow-lg z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
        <span className="text-sm font-medium">User {myId}</span>
      </div>
      <div className="text-xs space-y-1 text-muted-foreground">
        <div>Chat với: <strong>User {selectedUser?.id ?? '—'}</strong></div>
        <div>Conversation: <code>{currentConversationKey || '—'}</code></div>
        <div>Tin nhắn: {messages.length}</div>
        {typingUserId && <div>⌨️ User {typingUserId} đang gõ...</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      <main className="container px-4 py-8 max-w-7xl">
        <DebugPanel />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Tin nhắn</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <div className="divide-y">
                {conversationList.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">Không có người dùng — hoặc đang tải...</div>
                )}

                {conversationList.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors ${selectedUser?.id === conv.user.id ? "bg-accent" : ""}`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                        <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold truncate">{conv.user.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge variant="default" className="shrink-0">{conv.unread}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {selectedUser ? (
                      <>
                        <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                        <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>?</AvatarFallback>
                    )}
                  </Avatar>

                  <div>
                    <h3 className="font-semibold">{selectedUser ? selectedUser.name : 'Chọn người để bắt đầu'}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      {typingUserId === selectedUser?.id ? "Đang gõ..." : selectedUser ? "Đang hoạt động" : "—"}
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={handleSendDateProposal} disabled={!selectedUser}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Đề xuất hẹn
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === myId;
                return (
                  <div key={msg.tempId || msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[70%] space-y-1">
                      <div className={`rounded-2xl px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 justify-end px-2">
                        <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                        {isOwn && (msg.read ? (<CheckCheck className="h-3 w-3 text-primary" />) : (<Check className="h-3 w-3 text-muted-foreground" />))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">Chưa có tin nhắn — bắt đầu cuộc trò chuyện nào!</div>
              )}
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                  disabled={!selectedUser}
                />
                <Button onClick={handleSend} variant="hero" disabled={!input.trim() || !selectedUser}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Chat;
