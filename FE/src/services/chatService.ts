// src/services/chatService.ts
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp,
    Timestamp,
    getDocs,
    where,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

// 🎯 Types
export interface Message {
    id: string;
    senderId: number;
    receiverId: number;
    text: string;
    createdAt: Timestamp;
    isRead?: boolean;
}

export interface Conversation {
    id: string;
    partnerId: number;
    lastMessage: string;
    lastTime: Timestamp;
    unreadCount?: number;
    partnerInfo?: {
        username: string;
        fullName?: string;
        avatar?: string;
    };
}

/** 🧩 Hàm tạo chatId duy nhất giữa 2 người */
export function getChatId(u1: number, u2: number): string {
    return u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
}

/** 📨 Gửi tin nhắn */
export async function sendMessage(senderId: number, receiverId: number, text: string): Promise<void> {
    try {
        const chatId = getChatId(senderId, receiverId);
        const timestamp = serverTimestamp();

        // 1. Thêm tin nhắn vào collection messages
        await addDoc(collection(db, "chats", chatId, "messages"), {
            senderId,
            receiverId,
            text: text.trim(),
            createdAt: timestamp,
            isRead: false,
        });

        // 2. Cập nhật danh sách hội thoại cho cả hai người
        const conversationData = {
            partnerId: receiverId,
            lastMessage: text.trim(),
            lastTime: timestamp,
            updatedAt: timestamp,
        };

        const senderConversationData = {
            ...conversationData,
            partnerId: receiverId,
            unreadCount: 0, // Người gửi không có tin nhắn chưa đọc
        };

        const receiverConversationData = {
            ...conversationData,
            partnerId: senderId,
            unreadCount: 1, // Người nhận có 1 tin nhắn chưa đọc
        };

        await Promise.all([
            setDoc(
                doc(db, "conversations", senderId.toString(), "chats", receiverId.toString()),
                senderConversationData
            ),
            setDoc(
                doc(db, "conversations", receiverId.toString(), "chats", senderId.toString()),
                receiverConversationData
            ),
        ]);

        console.log(`✅ Tin nhắn đã gửi từ ${senderId} đến ${receiverId}`);
    } catch (error) {
        console.error("❌ Lỗi gửi tin nhắn:", error);
        throw new Error("Không thể gửi tin nhắn");
    }
}

/** 👂 Lắng nghe tin nhắn realtime */
export function listenMessages(
    u1: number,
    u2: number,
    callback: (msgs: Message[]) => void
): () => void {
    try {
        const chatId = getChatId(u1, u2);
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const messages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Message[];

                console.log(`📨 Nhận ${messages.length} tin nhắn`);
                callback(messages);
            },
            (error) => {
                console.error("❌ Lỗi lắng nghe tin nhắn:", error);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error("❌ Lỗi khởi tạo lắng nghe tin nhắn:", error);
        return () => { }; // Trả về hàm rỗng nếu có lỗi
    }
}

/** 👂 Lắng nghe danh sách hội thoại realtime */
export function listenConversations(
    userId: number,
    callback: (convs: Conversation[]) => void
): () => void {
    try {
        const conversationsRef = collection(db, "conversations", userId.toString(), "chats");
        const q = query(conversationsRef, orderBy("lastTime", "desc"));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const conversations = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Conversation[];

                console.log(`💬 Loaded ${conversations.length} conversations`);
                callback(conversations);
            },
            (error) => {
                console.error("❌ Lỗi lắng nghe hội thoại:", error);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error("❌ Lỗi khởi tạo lắng nghe hội thoại:", error);
        return () => { };
    }
}

/** ✅ Đánh dấu tin nhắn đã đọc */
export async function markMessagesAsRead(
    userId: number,
    partnerId: number,
    messageIds: string[]
): Promise<void> {
    try {
        const chatId = getChatId(userId, partnerId);
        const batch = messageIds.map(async (messageId) => {
            const messageRef = doc(db, "chats", chatId, "messages", messageId);
            await updateDoc(messageRef, { isRead: true });
        });

        await Promise.all(batch);

        // Cập nhật unreadCount trong conversation
        const conversationRef = doc(
            db,
            "conversations",
            userId.toString(),
            "chats",
            partnerId.toString()
        );
        await updateDoc(conversationRef, { unreadCount: 0 });

        console.log(`✅ Đã đánh dấu ${messageIds.length} tin nhắn là đã đọc`);
    } catch (error) {
        console.error("❌ Lỗi đánh dấu tin nhắn đã đọc:", error);
    }
}

/** 🔍 Lấy lịch sử tin nhắn (không realtime) */
export async function getMessageHistory(
    u1: number,
    u2: number,
    limit: number = 50
): Promise<Message[]> {
    try {
        const chatId = getChatId(u1, u2);
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "desc"), where("createdAt", "!=", null));

        const snapshot = await getDocs(q);
        const messages = snapshot.docs
            .slice(0, limit)
            .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];

        return messages.reverse(); // Đảo ngược để có thứ tự cũ → mới
    } catch (error) {
        console.error("❌ Lỗi lấy lịch sử tin nhắn:", error);
        return [];
    }
}

/** 🗑️ Xóa tin nhắn */
export async function deleteMessage(
    userId: number,
    partnerId: number,
    messageId: string
): Promise<void> {
    try {
        const chatId = getChatId(userId, partnerId);
        const messageRef = doc(db, "chats", chatId, "messages", messageId);

        // TODO: Thực hiện soft delete hoặc kiểm tra quyền
        // await deleteDoc(messageRef);

        console.log(`🗑️ Đã xóa tin nhắn ${messageId}`);
    } catch (error) {
        console.error("❌ Lỗi xóa tin nhắn:", error);
        throw new Error("Không thể xóa tin nhắn");
    }
}

/** 📊 Lấy thống kê tin nhắn */
export async function getChatStatistics(
    userId: number,
    partnerId: number
): Promise<{ totalMessages: number; unreadCount: number }> {
    try {
        const chatId = getChatId(userId, partnerId);
        const messagesRef = collection(db, "chats", chatId, "messages");

        const [totalSnapshot, unreadSnapshot] = await Promise.all([
            getDocs(messagesRef),
            getDocs(query(messagesRef, where("isRead", "==", false), where("senderId", "==", partnerId)))
        ]);

        return {
            totalMessages: totalSnapshot.size,
            unreadCount: unreadSnapshot.size,
        };
    } catch (error) {
        console.error("❌ Lỗi lấy thống kê chat:", error);
        return { totalMessages: 0, unreadCount: 0 };
    }
}

export default {
    sendMessage,
    listenMessages,
    listenConversations,
    markMessagesAsRead,
    getMessageHistory,
    deleteMessage,
    getChatStatistics,
    getChatId,
};