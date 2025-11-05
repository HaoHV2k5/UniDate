// src/pages/ChatFriends.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { useChatFirebase } from "@/hooks/useChatFirebase";

type Friend = {
  id: number | null;
  username: string;
  fullName?: string;
  avatar?: string;
  email?: string;
};

export default function ChatFriends() {
  const storedUsername = localStorage.getItem("username") || "";
  const currentUser = storedUsername;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [queryText, setQueryText] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const listRef = useRef<HTMLDivElement | null>(null);

  // hook firebase chat: truyền currentUser và callback setMessages
  const { sendMessage, subscribeMessages } = useChatFirebase(currentUser, setMessages);

  // fetch friends 
  useEffect(() => {
    if (!storedUsername) return;
    (async () => {
      try {
        const res = await api.get(`/friends/of/${encodeURIComponent(storedUsername)}`);
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


  useEffect(() => {
    setMessages([]);
    if (!selectedFriend) return;
    const friendKey = selectedFriend.username;
    const unsub = subscribeMessages(friendKey);
    // subscribeMessages trả về hàm unsubscribe (theo hook gốc)
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [selectedFriend?.username, subscribeMessages]);

  // auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const filtered = useMemo(
    () => friends.filter(f => (f.fullName || f.username).toLowerCase().includes(queryText.toLowerCase())),
    [friends, queryText]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedFriend) return;
    try {
      await sendMessage(selectedFriend.username, text);
      setInput("");
    } catch (e) {
      console.error("send msg err", e);
      toast.error("Gửi tin nhắn thất bại");
    }
  };

  const formatTime = (ts: any) => {
    try {
      // ts có thể là firebase.Timestamp hoặc ISO string
      if (!ts) return "";
      if (ts.toDate) return ts.toDate().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const d = new Date(ts);
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
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
                <div className="text-sm text-muted-foreground">{friends.length} bạn</div>
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
                  <div className="p-4 text-sm text-muted-foreground">Không tìm thấy bạn bè — Lêu lêu ko có bạn</div>
                )}

                {filtered.map(friend => (
                  <button
                    key={friend.id ?? friend.username}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left ${selectedFriend?.username === friend.username ? 'bg-accent' : ''}`}>
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.fullName ?? friend.username} />
                      <AvatarFallback>{(friend.fullName || friend.username || '?')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold truncate">{friend.fullName ?? friend.username}</span>
                        <span className="text-xs text-muted-foreground">{/* optional */}</span>
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
                    <h3 className="font-semibold">{selectedFriend ? (selectedFriend.fullName ?? selectedFriend.username) : 'Chọn bạn để bắt đầu'}</h3>
                    <p className="text-xs text-muted-foreground">{selectedFriend ? 'Đang hoạt động' : '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success('Đã gửi đề xuất lịch!')} disabled={!selectedFriend}>
                    Đề xuất hẹn
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4 space-y-4" ref={listRef}>
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">Chưa có tin nhắn — bắt đầu cuộc trò chuyện nào!</div>
              )}

              {messages.map((msg) => {
                const isOwn = (msg.sender === currentUser) || (msg.senderId && String(msg.senderId) === String(currentUser));
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%] space-y-1">
                      <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 justify-end px-2">
                        <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                  disabled={!selectedFriend}
                />
                <Button onClick={handleSend} variant="hero" disabled={!input.trim() || !selectedFriend}>
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
}
