package com.example.cms.notifications;

import com.example.cms.common.ApiResponse;
import com.example.cms.common.BusinessException;
import com.example.cms.common.PageResponse;
import com.example.cms.users.User;
import com.example.cms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationDto createNotification(UUID userId, String type, String title, String message,
                                              String referenceType, UUID referenceId,
                                              String actionUrl, String actionLabel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .isRead(false)
                .priority("NORMAL")
                .actionUrl(actionUrl)
                .actionLabel(actionLabel)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created for user {}: {}", userId, title);

        return toDto(notification);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationDto> getNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(notificationPage.map(this::toDto));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadNotifications(UUID userId) {
        return notificationRepository.findUnreadByUserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public NotificationDto markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> BusinessException.notFound("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw BusinessException.forbidden("You can only mark your own notifications as read");
        }

        notification.setIsRead(true);
        notification.setReadAt(Instant.now());
        notification = notificationRepository.save(notification);

        return toDto(notification);
    }

    @Transactional
    public int markAllAsRead(UUID userId) {
        int count = notificationRepository.markAllAsRead(userId);
        log.info("Marked {} notifications as read for user {}", count, userId);
        return count;
    }

    private NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .priority(notification.getPriority())
                .actionUrl(notification.getActionUrl())
                .actionLabel(notification.getActionLabel())
                .expiresAt(notification.getExpiresAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}