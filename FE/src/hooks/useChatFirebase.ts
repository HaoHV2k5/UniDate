import { useEffect } from "react";
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

export function useChatFirebase(currentUser: string, onMessages: any) {
    const sendMessage = async (receiver: string, content: string) => {
        await addDoc(collection(db, "messages"), {
            sender: currentUser,
            receiver,
            content,
            timestamp: serverTimestamp(),
            read: false
        });
    };

    const subscribeMessages = (friend: string) => {
        const q = query(
            collection(db, "messages"),
            where("sender", "in", [currentUser, friend]),
            where("receiver", "in", [currentUser, friend]),
            orderBy("timestamp", "asc")
        );

        return onSnapshot(q, (snapshot) => {
            const msgs: any[] = [];
            snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
            onMessages(msgs);
        });
    };

    return { sendMessage, subscribeMessages };
}
