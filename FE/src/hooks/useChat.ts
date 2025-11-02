// src/hooks/useChat.ts
import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type OnMessage = (msg: any) => void;
type OnTyping = (t: any) => void;

export function useChat(userId: number | undefined, token: string | null, onMessage: OnMessage, onTyping: OnTyping) {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!userId) return; // nothing to do

        // create SockJS + STOMP client
        const socket = new SockJS("http://localhost:3979/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            // pass token in connect headers so ChannelInterceptor on server can extract it
            connectHeaders: { Authorization: token ? `Bearer ${token}` : "" },
            reconnectDelay: 5000,
            onConnect: () => {
                // subscribe to user-specific queues
                client.subscribe(`/user/${userId}/queue/messages`, (msg) => {
                    try {
                        onMessage(JSON.parse(msg.body));
                    } catch {
                        onMessage(msg.body);
                    }
                });
                client.subscribe(`/user/${userId}/queue/typing`, (msg) => {
                    try {
                        onTyping(JSON.parse(msg.body));
                    } catch {
                        onTyping(msg.body);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error", frame);
            },
        });

        client.activate();
        clientRef.current = client;

        // cleanup: deactivate client when unmount or deps change
        return () => {
            if (clientRef.current) {
                try {
                    clientRef.current.deactivate();
                } catch (e) {
                    console.warn("Error deactivating STOMP client", e);
                }
                clientRef.current = null;
            }
        };
        // Put stable deps here. If onMessage/onTyping are re-created often,
        // wrap them in useCallback in the component to avoid re-subscribe loops.
    }, [userId, token, onMessage, onTyping]);

    const sendMessage = (payload: any) => {
        clientRef.current?.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(payload),
        });
    };

    const sendTyping = (payload: any) => {
        clientRef.current?.publish({
            destination: "/app/chat.typing",
            body: JSON.stringify(payload),
        });
    };

    return { sendMessage, sendTyping };
}
