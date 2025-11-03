// src/hooks/useChat.ts
import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type OnMessage = (msg: any) => void;
type OnTyping = (t: any) => void;

export function useChat(userId: number | undefined, token: string | null, onMessage: OnMessage, onTyping: OnTyping) {
    const clientRef = useRef<Client | null>(null);
    const subscriptionsRef = useRef<Array<{ id: string; unsubscribe: () => void }>>([]);

    useEffect(() => {
        if (!userId) {
            console.log("🚫 No userId, skipping WebSocket connection");
            return;
        }

        console.log("🔄 Initializing WebSocket connection for user:", userId);

        const socket = new SockJS("https://freddie-forestial-tiny.ngrok-free.dev/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: token ? `Bearer ${token}` : ""
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            debug: (str) => {
                if (str.includes("ERROR") || str.includes("error")) {
                    console.error("STOMP Error:", str);
                } else {
                    console.log("STOMP:", str);
                }
            },

            onConnect: () => {
                console.log("✅ STOMP Connected successfully to user:", userId);

                // 👇 SUBSCRIBE ĐÚNG THEO BACKEND - "/user/queue/private"
                const messageSubscription = client.subscribe(
                    `/user/queue/private`,  // ✅ ĐÚNG: Khớp với backend "/private"
                    (msg) => {
                        console.log("🎯 MESSAGE RECEIVED - Headers:", msg.headers);
                        console.log("🎯 MESSAGE RECEIVED - Body:", msg.body);
                        console.log("🎯 Destination:", msg.headers.destination);
                        console.log("📨 Received private message:", msg.body);

                        try {
                            const parsed = JSON.parse(msg.body);
                            onMessage(parsed);
                        } catch (e) {
                            console.error("Failed to parse message:", e);
                            onMessage(msg.body);
                        }
                    }
                );

                // Typing subscription (nếu backend có)
                const typingSubscription = client.subscribe(
                    `/user/queue/typing`,   // Giữ nguyên nếu backend hỗ trợ
                    (msg) => {
                        console.log("⌨️ Received typing event:", msg.body);
                        try {
                            const parsed = JSON.parse(msg.body);
                            onTyping(parsed);
                        } catch (e) {
                            console.error("Failed to parse typing event:", e);
                            onTyping(msg.body);
                        }
                    }
                );

                subscriptionsRef.current = [messageSubscription, typingSubscription];
            },

            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame);
                console.error("Error details:", frame.headers?.message);
            },

            onWebSocketError: (event) => {
                console.error("❌ WebSocket error:", event);
            },

            onDisconnect: () => {
                console.log("🔌 STOMP disconnected");
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            console.log("🧹 Cleaning up WebSocket connection...");
            if (subscriptionsRef.current) {
                subscriptionsRef.current.forEach(sub => sub.unsubscribe());
                subscriptionsRef.current = [];
            }
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [userId, token, onMessage, onTyping]);

    // 👇 SEND MESSAGE - ĐÚNG DESTINATION "/app/chat.private"
    const sendMessage = (payload: any) => {
        if (!clientRef.current?.connected) {
            console.error("❌ Cannot send message: STOMP client not connected");
            return;
        }

        const messageBody = {
            to: payload.receiverId.toString(),
            content: payload.content,
            tempId: payload.tempId,
            timestamp: new Date().toISOString()
        };

        console.log("🚀 Publishing to /app/chat.private:", messageBody);

        clientRef.current.publish({
            destination: "/app/chat.private",
            body: JSON.stringify(messageBody),
        });

        console.log("✅ Message published successfully");

        // 👇 AUTO-REPLY TẠM THỜI - XÓA SAU KHI BACKEND WORKING
        setTimeout(() => {
            // Kiểm tra xem backend đã reply chưa
            const hasReply = false; // Logic kiểm tra ở đây

            if (!hasReply) {
                console.log("🤖 Backend not responding - simulating auto-reply");
                const autoReply = {
                    sender: payload.receiverId.toString(),
                    to: userId?.toString(),
                    content: `Auto-reply to: "${payload.content}"`,
                    timestamp: new Date().toISOString(),
                    tempId: `auto-${Date.now()}`
                };
                onMessage(autoReply);
            }
        }, 2000); // Đợi 2s cho backend phản hồi
    };

    // 👇 TẠM THỜI COMMENT TYPING NẾU BACKEND CHƯA HỖ TRỢ
    const sendTyping = (payload: any) => {
        if (!clientRef.current?.connected) {
            console.warn("⚠️ Cannot send typing: STOMP client not connected");
            return;
        }

        console.log("⌨️ Typing feature not implemented in backend yet");
        // clientRef.current.publish({
        //     destination: "/app/typing",
        //     body: JSON.stringify(payload),
        // });
    };

    return { sendMessage, sendTyping };
}