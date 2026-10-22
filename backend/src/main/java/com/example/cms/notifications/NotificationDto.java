package com.example.cms.notifications;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    private UUID id;
    private String type;
    private String title;
    private String message;
    private String referenceType;
    private UUID referenceId;
    private Boolean isRead;
    private Instant readAt;
    private String priority;
    private String actionUrl;
    private String actionLabel;
    private Instant expiresAt;
    private Instant createdAt;
}