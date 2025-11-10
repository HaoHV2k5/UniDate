// components/NotificationBell.tsx
import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/api/api"; // Import axios instance

interface Notification {
    id: number;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
    triggerByName: string;
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Lấy thông báo từ API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/notification?page=0&size=10");

            if (response.data && response.data.data) {
                setNotifications(response.data.data.content);
                const unread = response.data.data.content.filter((n: Notification) => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (error: any) {
            console.error("Failed to fetch notifications", {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data
            });
            // Fallback để tránh lỗi UI
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Đánh dấu đã đọc
    const markAsRead = async (id: number) => {
        try {
            await api.put(`/api/notification/${id}/read`);
            setNotifications(prev =>
                prev.map(noti => noti.id === id ? { ...noti, isRead: true } : noti)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error: any) {
            console.error("Failed to mark as read", error.response?.data || error.message);
        }
    };

    // Xóa thông báo
    const deleteNotification = async (id: number) => {
        try {
            await api.delete(`/api/notification/${id}`);
            const deletedNotification = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(noti => noti.id !== id));
            setUnreadCount(prev =>
                deletedNotification?.read ? prev : Math.max(0, prev - 1)
            );
        } catch (error: any) {
            console.error("Failed to delete notification", error.response?.data || error.message);
        }
    };

    // Đánh dấu tất cả là đã đọc
    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            await Promise.all(unreadIds.map(id =>
                api.put(`/api/notification/${id}/read`)
            ));
            setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
            setUnreadCount(0);
        } catch (error: any) {
            console.error("Failed to mark all as read", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh mỗi 30 giây
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    onClick={() => setIsOpen(true)}
                    disabled={loading}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto p-0 text-xs text-blue-500 hover:text-blue-600"
                            disabled={loading}
                        >
                            Đánh dấu tất cả đã đọc
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <ScrollArea className="h-80">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Đang tải...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Không có thông báo
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "p-3 flex flex-col items-start cursor-pointer border-b group",
                                    !notification.read && "bg-blue-50"
                                )}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                                <div className="flex justify-between w-full items-start">
                                    <p className="text-sm font-medium flex-1 pr-2">
                                        {notification.message}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex justify-between w-full items-center mt-1">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    {!notification.read && (
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-center text-sm"
                                onClick={fetchNotifications}
                                disabled={loading}
                            >
                                {loading ? "Đang tải..." : "Tải lại thông báo"}
                            </Button>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};