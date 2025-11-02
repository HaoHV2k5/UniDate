// src/pages/Chat.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Calendar, Check, CheckCheck, Circle } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";

type Msg = {
  id?: string | number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read?: boolean;
};

const Chat = () => {
  const myId = Number(localStorage.getItem("userId")) || 1;
  const token = localStorage.getItem("accessToken");

  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [input, setInput] = useState("");
  const [typingUserId, setTypingUserId] = useState<number | null>(null);

  // --- FIX: Lưu tin nhắn theo cặp user ---
  const [conversations, setConversations] = useState<Record<string, Msg[]>>({
    // Khởi tạo một số cuộc trò chuyện mẫu
    '1_2': [
      { id: 1, senderId: 1, receiverId: 2, content: "Chào bạn! Mình thấy profile bạn rất thú vị 😊", timestamp: "2024-01-15T10:30:00", read: true },
      { id: 2, senderId: 2, receiverId: 1, content: "Hi! Cảm ơn bạn nhé. Mình thấy bạn cũng thích coding à?", timestamp: "2024-01-15T10:32:00", read: true },
      { id: 3, senderId: 1, receiverId: 2, content: "Đúng rồi! Bạn đang học CNTT năm mấy?", timestamp: "2024-01-15T10:33:00", read: true },
      { id: 4, senderId: 2, receiverId: 1, content: "Mình năm 3. Còn bạn?", timestamp: "2024-01-15T10:35:00", read: false },
    ],
    '1_3': [
      { id: 5, senderId: 3, receiverId: 1, content: "Hello! Bạn có rảnh không?", timestamp: "2024-01-15T11:20:00", read: true },
      { id: 6, senderId: 1, receiverId: 3, content: "Có mình đang rảnh nè!", timestamp: "2024-01-15T11:21:00", read: true },
    ],
    '2_3': [
      { id: 7, senderId: 2, receiverId: 3, content: "Ê, tối nay đi cafe không?", timestamp: "2024-01-15T12:00:00", read: true },
      { id: 8, senderId: 3, receiverId: 2, content: "Được đó, mấy giờ vậy?", timestamp: "2024-01-15T12:01:00", read: true },
    ]
  });

  // --- Hàm tạo conversation key từ 2 user ID ---
  const getConversationKey = (user1Id: number, user2Id: number): string => {
    const sortedIds = [user1Id, user2Id].sort((a, b) => a - b);
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  // --- Lấy tin nhắn cho cuộc trò chuyện hiện tại ---
  const currentConversationKey = getConversationKey(myId, selectedUser.id);
  const messages = useMemo(() =>
    conversations[currentConversationKey] || [],
    [conversations, currentConversationKey]
  );

  // ---------- STOMP hook integration ----------
  const onMessage = useCallback((incoming: any) => {
    const conversationKey = getConversationKey(incoming.senderId, incoming.receiverId);

    setConversations(prev => {
      const copy = { ...prev };
      const arr = copy[conversationKey] ? [...copy[conversationKey]] : [];

      // Kiểm tra trùng lặp tin nhắn
      const isDuplicate = arr.some(msg =>
        msg.id === incoming.id ||
        (msg.timestamp === incoming.timestamp && msg.content === incoming.content)
      );

      if (!isDuplicate) {
        arr.push({
          id: incoming.id ?? incoming.timestamp ?? `${Date.now()}`,
          senderId: incoming.senderId,
          receiverId: incoming.receiverId,
          content: incoming.content,
          timestamp: incoming.timestamp ?? new Date().toISOString(),
          read: incoming.read ?? false,
        });
        copy[conversationKey] = arr;
      }

      return copy;
    });
  }, []);

  const onTyping = useCallback((payload: any) => {
    if (payload.senderId && payload.receiverId === myId) {
      setTypingUserId(payload.senderId);
      setTimeout(() => {
        setTypingUserId(curr => (curr === payload.senderId ? null : curr));
      }, 2000);
    }
  }, [myId]);

  const { sendMessage, sendTyping } = useChat(myId, token, onMessage, onTyping);

  // ---------- typing debounce ----------
  const typingTimer = useRef<number | undefined>(undefined);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    sendTyping({ receiverId: selectedUser.id, senderId: myId });
    typingTimer.current = window.setTimeout(() => {
      typingTimer.current = undefined;
    }, 800);
  };

  // ---------- send handler ----------
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const tempId = `t-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const payload: Msg = {
      id: tempId,
      senderId: myId,
      receiverId: selectedUser.id,
      content: text,
      timestamp,
      read: false,
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
    sendMessage({
      receiverId: selectedUser.id,
      content: text,
      tempId,
    });

    setInput("");
  };

  useEffect(() => {
    setTypingUserId(null);
  }, [selectedUser.id]);

  // ---------- Tạo danh sách conversations cho UI ----------
  const conversationList = useMemo(() => {
    return mockUsers.slice(0, 5).map((user) => {
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
        unread: convMessages.filter(msg =>
          msg.senderId === user.id && !msg.read
        ).length,
        online: user.id === mockUsers[0].id || user.id === mockUsers[1].id,
      };
    });
  }, [conversations, myId]);

  const handleSendDateProposal = () => {
    toast.success("Đã gửi đề xuất lịch hẹn!");
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      <main className="container px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Tin nhắn</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <div className="divide-y">
                {conversationList.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors ${selectedUser.id === conv.user.id ? "bg-accent" : ""
                      }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                        <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold truncate">{conv.user.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge variant="default" className="shrink-0">
                        {conv.unread}
                      </Badge>
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
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedUser.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      {typingUserId === selectedUser.id ? "Đang gõ..." : "Đang hoạt động"}
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={handleSendDateProposal}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Đề xuất hẹn
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === myId;
                return (
                  <div
                    key={msg.id ?? msg.timestamp}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      <div
                        className={`rounded-2xl px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 justify-end px-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOwn &&
                          (msg.read ? (
                            <CheckCheck className="h-3 w-3 text-primary" />
                          ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} variant="hero">
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