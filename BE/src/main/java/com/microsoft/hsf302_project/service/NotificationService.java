package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.entity.Notification;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.dto.response.NotificationResponse;
import com.microsoft.hsf302_project.mapper.NotificationMapper;
import com.microsoft.hsf302_project.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    public void notifyRequestAccessAccept(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.APPROVE_REQUEST_ACCESS, message);
    }
    public void notifyRequestAccessReject(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.REJECT_REQUEST_ACCESS, message);
    }
    public void notifyFriendRequest(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.FRIEND_REQUEST, message);
    }
    public void notifyFriendAccept(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.FRIEND_ACCEPT, message);
    }
    public void notifyFriendReject(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.FRIEND_REJECT, message);
    }
    public void notifyAlbumAccessRequest(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.ALBUM_ACCESS_REQUEST, message);
    }
    public void notifyPostLike(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.POST_LIKE, message);
    }
    public void notifyPostDislike(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.POST_DISLIKE, message);
    }
    public void notifyPostComment(User toUser, User triggerBy, String message) {
        saveNotification(toUser, triggerBy, Notification.NotificationType.POST_COMMENT, message);
    }
    private void saveNotification(User toUser, User triggerBy, Notification.NotificationType type, String message) {
        Notification noti = Notification.builder()
                .user(toUser)
                .triggerBy(triggerBy)
                .type(type)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(noti);
    }
    public Page<NotificationResponse> getNotificationsForUser(Long userId, int page, int size) {
        Page<Notification> notis = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        return notis.map(notificationMapper::toNotificationResponse);
    }
    public void markAsRead(Long id, Long userId) {
        Notification noti = notificationRepository.findById(id).orElseThrow();
        if (!noti.getUser().getId().equals(userId)) throw new RuntimeException("No permission");
        noti.setRead(true);
        notificationRepository.save(noti);
    }
    public void deleteNotification(Long id, Long userId) {
        Notification noti = notificationRepository.findById(id).orElseThrow();
        if (!noti.getUser().getId().equals(userId)) throw new RuntimeException("No permission");
        notificationRepository.delete(noti);
    }
}
