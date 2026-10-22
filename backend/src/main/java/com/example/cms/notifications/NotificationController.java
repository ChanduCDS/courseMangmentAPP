package com.example.cms.notifications;

import com.example.cms.common.ApiResponse;
import com.example.cms.common.PageResponse;
import com.example.cms.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        PageResponse<NotificationDto> response = notificationService.getNotifications(userPrincipal.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        long count = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<java.util.List<NotificationDto>>> getUnreadNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        java.util.List<NotificationDto> notifications = notificationService.getUnreadNotifications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        NotificationDto notification = notificationService.markAsRead(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        int count = notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(count, "All notifications marked as read"));
    }
}