// src/pages/ChatFriends.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Bell } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { listenMessages, sendMessage } from "@/services/chatService";

type Friend = {
  id: number | null;
  username: string;
  fullName?: string;
  avatar?: string;
  email?: string;
};

// Sửa lại type FriendRequest để khớp với API response
type FriendRequest = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  fullName: string;
  gender: string | null;
  yob: number | null;
  avatar: string | null;
  address: string | null;
};

type Message = {
  id: string;
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: any;
};

export default function ChatFriends() {
  const storedUsername = localStorage.getItem("username") || "";
  const currentUserId = parseInt(localStorage.getItem("userId") || "0", 10);
  const currentUser = storedUsername;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [queryText, setQueryText] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const requestsRef = useRef<HTMLDivElement | null>(null);

  // Kiểm tra lời mời kết bạn khi vào trang
  useEffect(() => {
    checkFriendRequests();

    const interval = setInterval(checkFriendRequests, 30000);
    return () => clearInterval(interval);
  }, [storedUsername]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (requestsRef.current && !requestsRef.current.contains(event.target as Node)) {
        setShowRequests(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // fetch friends 
  useEffect(() => {
    if (!storedUsername) return;
    (async () => {
      try {
        const res = await api.get(`api/friend/of/${encodeURIComponent(storedUsername)}`);
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : [];
        const mapped = list.map((u: any) => ({
          id: u.id ?? null,
          username: u.username,
          fullName: u.fullName ?? u.username,
          avatar: u.avatar,
          email: u.email,
        }));
        setFriends(mapped);
        if (!selectedFriend && mapped.length) setSelectedFriend(mapped[0]);
      } catch (err) {
        console.error("Lỗi fetch friends:", err);
        toast.error("Không lấy được danh sách bạn bè");
      }
    })();
  }, [storedUsername]);

  // Lắng nghe tin nhắn realtime khi chọn bạn
  useEffect(() => {
    if (!selectedFriend || !currentUserId || !selectedFriend.id) return;

    setMessages([]);

    const unsubscribe = listenMessages(
      currentUserId,
      selectedFriend.id,
      (newMessages: Message[]) => {
        setMessages(newMessages);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedFriend?.id, currentUserId]);

  // auto-scroll khi có tin nhắn mới
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Kiểm tra lời mời kết bạn
  const checkFriendRequests = async () => {
    if (!storedUsername) return;

    try {
      const res = await api.get('api/friend/requests/incoming');
      const requests = res.data?.data || [];
      console.log("Friend requests data:", requests); // Debug log
      setFriendRequests(requests);

      if (requests.length > 0 && !hasNewRequests) {
        setHasNewRequests(true);
      }
    } catch (err) {
      console.error("Lỗi kiểm tra lời mời kết bạn:", err);
    }
  };

  // Xử lý chấp nhận lời mời - CẦN CÓ requestId từ API
  const handleAcceptRequest = async (requestId: number) => {
    try {
      await api.post(`api/friend/accept/${requestId}`);
      toast.success("Đã chấp nhận lời mời kết bạn");

      // Cập nhật danh sách
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      setHasNewRequests(friendRequests.length > 1);

      // Refresh danh sách bạn bè
      const res = await api.get(`api/friend/of/${encodeURIComponent(storedUsername)}`);
      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload) ? payload : [];
      const mapped = list.map((u: any) => ({
        id: u.id ?? null,
        username: u.username,
        fullName: u.fullName ?? u.username,
        avatar: u.avatar,
        email: u.email,
      }));
      setFriends(mapped);
    } catch (err) {
      console.error("Lỗi chấp nhận lời mời:", err);
      toast.error("Không thể chấp nhận lời mời");
    }
  };

  // Xử lý từ chối lời mời - CẦN CÓ requestId từ API
  const handleRejectRequest = async (requestId: number) => {
    try {
      await api.post(`api/friend/reject/${requestId}`);
      toast.success("Đã từ chối lời mời kết bạn");

      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      setHasNewRequests(friendRequests.length > 1);
    } catch (err) {
      console.error("Lỗi từ chối lời mời:", err);
      toast.error("Không thể từ chối lời mời");
    }
  };

  const filtered = useMemo(
    () => friends.filter(f => (f.fullName || f.username).toLowerCase().includes(queryText.toLowerCase())),
    [friends, queryText]
  );

  // Gửi tin nhắn sử dụng Firestore
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedFriend || !currentUserId || !selectedFriend.id) return;

    setIsLoading(true);
    try {
      await sendMessage(currentUserId, selectedFriend.id, text);
      setInput("");
    } catch (e) {
      console.error("send msg err", e);
      toast.error("Gửi tin nhắn thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Format thời gian cho tin nhắn
  const formatTime = (timestamp: any) => {
    try {
      if (!timestamp) return "";

      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      <main className="container px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* LEFT: Friends */}
          <Card className="lg:col-span-1 shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Bạn bè</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">{friends.length} bạn</div>
                  {/* Nút thông báo lời mời kết bạn */}
                  <div className="relative" ref={requestsRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowRequests(!showRequests);
                        setHasNewRequests(false);
                      }}
                      className="relative"
                    >
                      <Bell className="h-5 w-5" />
                      {hasNewRequests && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </Button>

                    {/* Dropdown danh sách lời mời - ĐÃ SỬA LỖI */}
                    {showRequests && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg border z-50 max-h-96 overflow-auto">
                        <div className="p-4 border-b">
                          <h4 className="font-semibold">Lời mời kết bạn</h4>
                        </div>

                        {friendRequests.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Không có lời mời kết bạn
                          </div>
                        ) : (
                          <div className="divide-y">
                            {friendRequests.map((request) => (
                              <div key={request.id} className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar>
                                    {/* SỬA: sử dụng trực tiếp request.avatar thay vì request.sender.avatar */}
                                    <AvatarImage src={request.avatar || ""} alt={request.fullName} />
                                    <AvatarFallback>
                                      {(request.fullName || request.username || '?')[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {request.fullName || request.username}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {request.email || request.username}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptRequest(request.id)}
                                    className="flex-1"
                                  >
                                    Chấp nhận
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="flex-1"
                                  >
                                    Từ chối
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <div className="p-3 border-b">
              <div className="relative">
                <Input
                  placeholder="Tìm bạn..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 text-muted-foreground" />
              </div>
            </div>

            <CardContent className="flex-1 overflow-auto p-0">
              <div className="divide-y">
                {filtered.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">Không tìm thấy bạn bè</div>
                )}

                {filtered.map(friend => (
                  <button
                    key={friend.id ?? friend.username}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left ${selectedFriend?.username === friend.username ? 'bg-accent' : ''
                      }`}
                  >
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.fullName ?? friend.username} />
                      <AvatarFallback>{(friend.fullName || friend.username || '?')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold truncate">{friend.fullName ?? friend.username}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{friend.email ?? friend.username}</p>
                    </div>
                    <Badge variant="default" className="shrink-0">Chat</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Chat */}
          <Card className="lg:col-span-2 shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {selectedFriend ? (
                      <>
                        <AvatarImage src={selectedFriend.avatar} alt={selectedFriend.fullName} />
                        <AvatarFallback>{(selectedFriend.fullName || selectedFriend.username || '?')[0]}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>?</AvatarFallback>
                    )}
                  </Avatar>

                  <div>
                    <h3 className="font-semibold">
                      {selectedFriend ? (selectedFriend.fullName ?? selectedFriend.username) : 'Chọn bạn để bắt đầu'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedFriend ? 'Đang hoạt động' : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success('Đã gửi đề xuất lịch!')}
                    disabled={!selectedFriend}
                  >
                    Đề xuất hẹn
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4 space-y-4" ref={listRef}>
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  {selectedFriend ? 'Chưa có tin nhắn — bắt đầu cuộc trò chuyện nào!' : 'Chọn một người bạn để bắt đầu chat'}
                </div>
              )}

              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%] space-y-1">
                      <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder={selectedFriend ? `Nhắn cho ${selectedFriend.fullName ?? selectedFriend.username}...` : 'Chọn một bạn để nhắn'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  className="flex-1"
                  disabled={!selectedFriend || isLoading}
                />
                <Button
                  onClick={handleSend}
                  variant="hero"
                  disabled={!input.trim() || !selectedFriend || isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}